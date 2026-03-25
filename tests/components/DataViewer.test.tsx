import React from 'react';
import { render, screen } from '@testing-library/react';

import { DataViewer } from '@/components/DataViewer';

vi.mock('@/lib/datastore-client', () => ({
  getResourcePreview: vi.fn().mockRejectedValue(new Error('Fallo de prueba')),
}));

describe('DataViewer', () => {
  it('renders an accessible dialog and shows inline errors', async () => {
    render(
      <DataViewer
        onClose={vi.fn()}
        resource={{
          datastore_active: true,
          format: 'CSV',
          id: 'resource-1',
          name: 'Recurso de prueba',
          package_id: 'dataset-1',
          url: 'https://example.com/resource.csv',
        }}
      />
    );

    expect(
      screen.getByRole('dialog', { name: /recurso de prueba/i })
    ).toBeInTheDocument();

    expect(await screen.findByText(/No se pudo abrir el recurso/i)).toBeVisible();
    expect(screen.getByText(/Fallo de prueba/i)).toBeVisible();
  });
});
