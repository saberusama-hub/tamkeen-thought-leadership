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
  if (v == null) return '–';
  if (typeof v === 'object') {
    const cls =
      v.tone === 'pos'
        ? 'text-green font-semibold'
        : v.tone === 'neg'
          ? 'text-ink font-semibold'
          : '';
    return <span className={cls}>{v.value}</span>;
  }
  return v;
}

/**
 * Newspaper table: hairline rules only. Top of header, bottom of header,
 * bottom of table. No vertical rules. No zebra striping. Tabular numerals.
 * Numerics right-aligned, labels left-aligned.
 */
export function DataTable({ caption, columns, rows, cellRender }: DataTableProps) {
  return (
    <div className="my-10 -mx-2 overflow-x-auto">
      <table
        className="w-full border-collapse font-sans text-[14px] mx-2 max-[640px]:text-[12px]"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {caption ? (
          <caption className="text-left font-serif font-medium text-[20px] mb-4 text-ink caption-top max-[640px]:text-[17px]">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-y border-ink">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`px-3 py-3 font-sans font-semibold text-[10.5px] tracking-[1.5px] uppercase text-ink align-bottom max-[640px]:px-1.5 max-[640px]:py-2 max-[640px]:text-[9.5px] max-[640px]:tracking-[1.2px] ${
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
            <tr key={ri}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-2.5 border-b border-rule text-ink/90 align-top max-[640px]:px-1.5 max-[640px]:py-2 ${
                    c.numeric
                      ? 'text-right tabular-nums whitespace-nowrap'
                      : c.align === 'right'
                        ? 'text-right'
                        : ''
                  }`}
                  style={c.numeric ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                >
                  {cellRender ? cellRender(c, r) : renderCell(c, r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
