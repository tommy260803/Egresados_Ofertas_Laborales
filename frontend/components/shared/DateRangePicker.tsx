"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";

export function DateRangePicker({ value, onChange }: any) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from ? format(value.from, "PPP", { locale: es }) : "Desde"} -{" "}
          {value.to ? format(value.to, "PPP", { locale: es }) : "Hasta"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="range" selected={value} onSelect={onChange} locale={es} />
      </PopoverContent>
    </Popover>
  );
}