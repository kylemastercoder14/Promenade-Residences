"use client";

import { useEffect } from "react";

interface PrintViewProps {
  title: string;
  description?: string;
  columns: Array<{
    header: string;
    accessor: string | ((row: any) => string | number | null | undefined);
  }>;
  data: any[];
  onClose?: () => void;
}

export const PrintView = ({
  title,
  description,
  columns,
  data,
  onClose,
}: PrintViewProps) => {

  useEffect(() => {
    // Wait a bit for the component to render, then trigger print
    const timer = setTimeout(() => {
      // Ensure data is loaded before printing
      if (data && data.length >= 0) {
        window.print();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data]);

  const getCellValue = (row: any, accessor: string | ((row: any) => string | number | null | undefined)): string => {
    if (typeof accessor === "function") {
      const value = accessor(row);
      return value !== null && value !== undefined ? String(value) : "";
    }
    const value = row[accessor];
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      // Handle nested objects - extract text only
      if (value.name) return value.name;
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`.trim();
      }
      // For badges/status objects, try to get label or text
      if (value.label) return value.label;
      if (value.text) return value.text;
      return "";
    }
    // Convert boolean to text
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  return (
    <>
      {/* Hidden print-only content */}
      <div
        id="print-view-container"
        className="print-only"
        style={{
          padding: '20px',
          color: 'black',
          backgroundColor: 'white'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '2px solid black', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>{title}</h1>
          <p style={{ fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            Generated on {new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>

        {/* Table */}
        {data && Array.isArray(data) && data.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid black'
            }}>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      try {
                        const cellValue = getCellValue(row, column.accessor);
                        return (
                          <td
                            key={colIndex}
                            style={{
                              border: '1px solid black',
                              padding: '8px',
                              fontSize: '12px'
                            }}
                          >
                            {cellValue || ''}
                          </td>
                        );
                      } catch (error) {
                        console.error('Error getting cell value:', error, row, column);
                        return (
                          <td
                            key={colIndex}
                            style={{
                              border: '1px solid black',
                              padding: '8px',
                              fontSize: '12px'
                            }}
                          >
                            -
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '40px', fontSize: '14px' }}>
            {!data ? 'Loading data...' : data.length === 0 ? 'No data available' : 'Invalid data format'}
          </p>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', fontSize: '12px' }}>
          <p>Total Records: {data?.length || 0}</p>
        </div>
      </div>

      {/* Screen view overlay */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 9999,
          padding: '20px',
          color: 'black',
          overflow: 'auto',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '2px solid black', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>{title}</h1>
          <p style={{ fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            Generated on {new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
          <button
            onClick={onClose}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#327248',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Table */}
        {data && Array.isArray(data) && data.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid black'
            }}>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      try {
                        const cellValue = getCellValue(row, column.accessor);
                        return (
                          <td
                            key={colIndex}
                            style={{
                              border: '1px solid black',
                              padding: '8px',
                              fontSize: '12px'
                            }}
                          >
                            {cellValue || ''}
                          </td>
                        );
                      } catch (error) {
                        return (
                          <td
                            key={colIndex}
                            style={{
                              border: '1px solid black',
                              padding: '8px',
                              fontSize: '12px'
                            }}
                          >
                            -
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '40px', fontSize: '14px' }}>
            {!data ? 'Loading data...' : data.length === 0 ? 'No data available' : 'Invalid data format'}
          </p>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', fontSize: '12px' }}>
          <p>Total Records: {data?.length || 0}</p>
        </div>
      </div>
    </>
  );
};

