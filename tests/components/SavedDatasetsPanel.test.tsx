import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SavedDatasetsPanel } from '@/components/SavedDatasetsPanel';

describe('SavedDatasetsPanel', () => {
  it('opens and removes saved datasets', async () => {
    const onOpenDataset = vi.fn();
    const onRemoveDataset = vi.fn();
    const user = userEvent.setup();

    render(
      <SavedDatasetsPanel
        datasets={[
          {
            id: 'dataset-1',
            organization: 'Organizacion',
            title: 'Dataset guardado',
          },
        ]}
        onOpenDataset={onOpenDataset}
        onRemoveDataset={onRemoveDataset}
      />
    );

    await user.click(screen.getByText('Dataset guardado').closest('button')!);
    await user.click(
      screen.getByRole('button', {
        name: /quitar dataset guardado de guardados/i,
      })
    );

    expect(onOpenDataset).toHaveBeenCalledWith('dataset-1');
    expect(onRemoveDataset).toHaveBeenCalledWith('dataset-1');
  });
});
