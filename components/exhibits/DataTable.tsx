import type { ReactNode } from 'react';

export interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
  width?: string;
}

export interface DataTableRow {
  [k: string]: string | number | { value: string; tone?: 'pos' | 'neg' | 'flat' } | undefined;
}

interface DataTableProps {
  caption?: string;
  columns: Column[];
  rows: DataTableRow[];
  cellRender?: (col: Column, row: DataTableRow) => ReactNode;
}

function renderCell(col: Column, row: DataTableRow): ReactNode {
  const v = row[col.key];
  if (v == null) return '-';
  if (typeof v === 'object') {
    const cls =
      v.tone === 'pos'
        ? 'text-tamkeen font-semibold'
        : v.tone === 'neg'
          ? 'text-neg font-semibold'
          : '';
    return <span className={cls}>{v.value}</span>;
  }
  return v;
}

export function DataTable({ caption, columns, rows, cellRender }: DataTableProps) {
  return (
    <table className="w-full border-collapse my-6 font-sans text-[13.5px]">
      {caption ? (
        <caption className="text-left font-serif font-semibold text-[18px] mb-2.5 text-tamkeen caption-top">
          {caption}
        </caption>
      ) : null}
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              scope="col"
              className={`px-3.5 py-3 bg-tamkeen text-paper font-semibold text-[10.5px] tracking-[1.4px] uppercase border-none ${
                c.numeric || c.align === 'right' ? 'text-right' : 'text-left'
              }`}
              style={c.width ? { width: c.width } : undefined}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} className="hover:bg-paper-shade/60">
            {columns.map((c) => (
              <td
                key={c.key}
                className={`px-3.5 py-2.5 border-b border-rule-soft text-ink bg-paper ${
                  c.numeric
                    ? 'text-right font-mono text-[13px] tabular-nums'
                    : c.align === 'right'
                      ? 'text-right'
                      : ''
                }`}
                style={c.numeric ? { fontFeatureSettings: '"tnum" 1' } : undefined}
              >
                {cellRender ? cellRender(c, r) : renderCell(c, r)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
