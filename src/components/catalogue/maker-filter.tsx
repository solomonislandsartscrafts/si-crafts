'use client';

import { Select } from '@/components/ui/select';
import type { Maker } from '@/types';

interface MakerFilterProps {
  makers: Maker[];
  selected: string | null;
  onChange: (makerId: string | null) => void;
}

export function MakerFilter({ makers, selected, onChange }: MakerFilterProps) {
  const selectOptions = makers.map((maker) => ({
    value: maker.id,
    label: maker.name,
  }));

  return (
    <Select
      id="maker-filter"
      value={selected}
      onChange={onChange}
      options={selectOptions}
      placeholder="All makers"
      label="Filter by maker"
    />
  );
}
