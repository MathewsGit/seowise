'use client';

import React from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  isMonospace?: boolean;
  isSortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  ariaLabel?: string;
}

export function DataTable<T extends { id?: string | number }>({ 
  columns, 
  data, 
  sortKey, 
  sortDirection, 
  onSort, 
  ariaLabel 
}: DataTableProps<T>) {
  
  return (
    <div className={styles.container} tabIndex={0} role="region" aria-label={ariaLabel || "Data table"}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={String(col.key)} 
                scope="col"
                className={`${styles.th} ${col.isSortable ? styles.sortable : ''}`}
                onClick={() => col.isSortable && onSort && onSort(String(col.key))}
                aria-sort={sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {col.label}
                {col.isSortable && (
                  <svg className={styles.sortIcon} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                    {sortKey === col.key && sortDirection === 'desc' 
                      ? <polygon points="0,2 10,2 5,8" /> 
                      : <polygon points="0,8 10,8 5,2" />
                    }
                  </svg>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className={styles.tr}>
              {columns.map((col, colIndex) => {
                const cellValue: React.ReactNode = col.render
                  ? col.render(row)
                  : (typeof col.key === 'string' && col.key in row
                    ? (row[col.key as keyof T] as React.ReactNode)
                    : undefined);
                const isEmpty = cellValue === null || cellValue === undefined || cellValue === '';
                
                const cellContent = isEmpty ? '–' : cellValue;
                const cellClass = `${styles.td} ${col.isMonospace ? styles.monospace : ''}`;
                
                return colIndex === 0 ? (
                  <th 
                    key={String(col.key)} 
                    className={cellClass}
                    scope="row"
                  >
                    {cellContent}
                  </th>
                ) : (
                  <td 
                    key={String(col.key)} 
                    className={cellClass}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr className={styles.tr}>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center', padding: '32px' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}