import React from 'react';
import './Table.css';

/**
 * Table — responsive data table
 *
 * Props:
 *   columns  — [{ key, label, render? }]
 *   data     — array of row objects
 *   loading  — bool
 *   emptyMsg — string (shown when data is empty)
 */
function Table({ columns = [], data = [], loading = false, emptyMsg = 'No records found.' }) {
  return (
    <div className="table-wrapper">
      <table className="table" role="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="table__th">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                <span className="table__loading-spinner" aria-label="Loading" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row._id || row.id || i} className="table__row">
                {columns.map((col) => (
                  <td key={col.key} className="table__td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
