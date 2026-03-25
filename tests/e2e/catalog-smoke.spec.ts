import { expect, test } from '@playwright/test';

test('can search datasets, open details, and preview a resource', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Explorador de Datos Abiertos de Uruguay/i })
  ).toBeVisible();

  await page.getByRole('searchbox', { name: /Buscar datasets/i }).fill('Registro Nacional de Egresos Hospitalarios');
  await page.getByRole('button', { name: /^Buscar$/i }).click();

  await expect(page).toHaveURL(/q=Registro\+Nacional\+de\+Egresos\+Hospitalarios/);
  await expect(page.getByRole('button', { name: /Ver detalle/i }).first()).toBeVisible();

  await page.getByRole('button', { name: /Ver detalle/i }).first().click();

  await expect(page).toHaveURL(/dataset=/);
  await expect(page.getByRole('dialog').first()).toBeVisible();

  const previewButton = page.getByRole('button', { name: /Previsualizar datos/i }).first();
  await expect(previewButton).toBeVisible({ timeout: 30000 });
  await previewButton.click();

  await expect(page).toHaveURL(/resource=/);
  await expect(page.getByRole('button', { name: /Cerrar previsualizacion del recurso/i })).toBeVisible();
  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
});
