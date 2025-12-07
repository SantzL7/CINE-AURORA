import React from 'react';

function AdminList({ items, loading, onEdit, onDelete }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Catálogo atual</h2>
      {loading && <div>Carregando títulos...</div>}
      {!loading && items.length === 0 && <div>Sem títulos cadastrados.</div>}
      {!loading && items.length > 0 && (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map(item => (
            <div
              key={item.id}
              className="admin-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>{item.title}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {item.type === 'series' ? 'Série' : 'Filme'} • {item.genre} •{' '}
                  {item.year || 'Sem ano'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn--secondary"
                  onClick={() => onEdit(item)}
                  style={{ padding: '6px 12px' }}
                >
                  Editar
                </button>
                <button
                  className="btn btn--danger"
                  onClick={() => onDelete(item.id, item.collectionType)}
                  style={{ padding: '6px 12px' }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default React.memo(AdminList);
