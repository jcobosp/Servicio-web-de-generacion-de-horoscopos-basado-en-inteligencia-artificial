import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type {
  NatalSnapshot,
  Report,
  ReportInterpretation,
  ReportKind,
  ReportParams,
  ReportResponse,
  TransitAspect,
  BodyPosition,
} from './types';

/**
 * Invoca la generación del informe (mensual/anual). Como el resto de funciones
 * premium, parseamos los cuerpos con código != 200 (403 `forbidden`,
 * 400 `missing_data`) en vez de tratarlos como error genérico.
 */
export async function generateReport(params: ReportParams): Promise<ReportResponse> {
  const { data, error } = await supabase.functions.invoke<ReportResponse>(
    'generate-report',
    { body: params },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as ReportResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-report');
  return data;
}

/** Inicio del periodo en curso (YYYY-MM-DD) en la zona de Madrid. */
export function currentPeriodStart(kind: ReportKind): string {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return kind === 'monthly' ? `${today.slice(0, 7)}-01` : `${today.slice(0, 4)}-01-01`;
}

interface StoredBlob {
  chart: {
    natal: NatalSnapshot;
    transits: BodyPosition[];
    aspects: TransitAspect[];
    period_label: string;
  };
  place: string | null;
}

function rowToReport(row: {
  kind: string; period_start: string; data: unknown; report: string; created_at: string;
}): Report | null {
  let interpretation: ReportInterpretation;
  try {
    interpretation = JSON.parse(row.report) as ReportInterpretation;
  } catch {
    return null;
  }
  const blob = row.data as unknown as StoredBlob;
  if (!blob?.chart) return null;
  return {
    kind: row.kind as ReportKind,
    period_start: row.period_start,
    period_label: blob.chart.period_label,
    place: blob.place ?? null,
    natal: blob.chart.natal,
    transits: blob.chart.transits,
    aspects: blob.chart.aspects,
    interpretation,
    created_at: row.created_at,
  };
}

/** Informe del periodo EN CURSO del usuario (si ya se generó). */
export async function fetchCurrentReport(
  userId: string,
  kind: ReportKind,
): Promise<Report | null> {
  const { data, error } = await supabase
    .from('premium_reports')
    .select('kind, period_start, data, report, created_at')
    .eq('user_id', userId)
    .eq('kind', kind)
    .eq('period_start', currentPeriodStart(kind))
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToReport(data);
}

/** Resumen de un informe guardado (para el historial). */
export interface ReportHistoryItem {
  id: string;
  kind: ReportKind;
  period_start: string;
  created_at: string;
}

/** Historial de informes del usuario para un tipo (lectura propia vía RLS). */
export async function fetchReportHistory(
  userId: string,
  kind: ReportKind,
): Promise<ReportHistoryItem[]> {
  const { data, error } = await supabase
    .from('premium_reports')
    .select('id, kind, period_start, created_at')
    .eq('user_id', userId)
    .eq('kind', kind)
    .order('period_start', { ascending: false })
    .limit(12);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind as ReportKind,
    period_start: r.period_start,
    created_at: r.created_at,
  }));
}

/** Carga un informe concreto del usuario por id (lectura propia). */
export async function fetchReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('premium_reports')
    .select('kind, period_start, data, report, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToReport(data);
}
