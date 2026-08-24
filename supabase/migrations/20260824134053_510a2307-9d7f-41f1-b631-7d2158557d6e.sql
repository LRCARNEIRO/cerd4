UPDATE public.indicadores_interseccionais SET subcategoria='ciganos' WHERE subcategoria='Ciganos/Romani';
UPDATE public.indicadores_interseccionais SET subcategoria='deficit_racial' WHERE subcategoria IN ('deficit_habitacional','deficit_habitacional_racial');
UPDATE public.indicadores_interseccionais SET subcategoria='saneamento' WHERE subcategoria='saneamento_racial';
UPDATE public.indicadores_interseccionais SET categoria='cultura_patrimonio' WHERE categoria='Cultura';