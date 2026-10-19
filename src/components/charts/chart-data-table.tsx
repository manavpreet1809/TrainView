type Cell = string | number | null;
export function ChartDataTable({caption, headers, rows}: {caption: string; headers: string[]; rows: Cell[][]}) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2">View chart data</summary>
      <div className="mt-2 overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead><tr>{headers.map(header => <th key={header} scope="col" className="border-b px-3 py-2">{header}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column} className="border-b px-3 py-2">{value === null ? 'Unavailable' : value}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}
