'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'

interface DateRangeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <Calendar className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="short_term">Last 4 Weeks</SelectItem>
        <SelectItem value="medium_term">Last 6 Months</SelectItem>
        <SelectItem value="long_term">All Time</SelectItem>
      </SelectContent>
    </Select>
  )
}
