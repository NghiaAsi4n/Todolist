import * as React from "react";
import { Check, ChevronsUpDown, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { options } from "@/lib/data";

const DateTimeFilter = ({ dateQuery, setDateQuery }) => {
  const [open, setOpen] = React.useState(false);

  const currentLabel = dateQuery
    ? options.find((option) => option.value === dateQuery)?.label
    : options[0].label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[180px] justify-between transition-all border-primary/30",
            "text-primary font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/50",
            "dark:text-violet-300 dark:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200",
            open && "ring-2 ring-primary/20 border-primary dark:ring-violet-400/20 dark:border-violet-400"
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {currentLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[180px] p-0 border-primary/20 shadow-lg shadow-primary/5 dark:border-violet-500/30 dark:bg-slate-950">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    setDateQuery(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer transition-colors",
                    "aria-selected:bg-primary/10 aria-selected:text-primary",
                    "dark:aria-selected:bg-violet-500/20 dark:aria-selected:text-violet-200"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      "text-primary dark:text-violet-300",
                      dateQuery === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimeFilter;