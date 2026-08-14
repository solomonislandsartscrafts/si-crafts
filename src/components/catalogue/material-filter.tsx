'use client';

import { Select } from '@/components/ui/select';
import type { MaterialCategoryOption } from '@/services/categories';

interface MaterialFilterProps {
  selected: string | null;
  onChange: (value: string | null) => void;
  /** Pre-fetched options passed from server component */
  options?: MaterialCategoryOption[];
}

export function MaterialFilter({ selected, onChange, options = [] }: MaterialFilterProps) {
  const selectOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <Select
      id="material-filter"
      value={selected}
      onChange={onChange}
      options={selectOptions}
      placeholder="All craft types"
      label="Filter by craft type"
    />
  );
}
