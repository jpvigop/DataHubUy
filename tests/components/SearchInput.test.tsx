import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchInput } from '@/components/SearchInput';

describe('SearchInput', () => {
  it('submits the trimmed query', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchInput initialQuery="agua" onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', {
      name: /buscar datasets/i,
    });

    await user.clear(input);
    await user.type(input, '  energia renovable  ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('energia renovable');
  });
});
