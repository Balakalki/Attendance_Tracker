import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TimetableConfig from "./TimetableConfig";
import TimetableEdit from "./TimetableEdit";
import { SlidersHorizontal, LayoutGrid } from "lucide-react";

const triggerClass =
  "gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm";

export default function ManageTimetable({ data, onSave }) {
  return (
    <Tabs defaultValue="configTimetable" className="gap-5">
      <TabsList className="h-11 w-full max-w-sm rounded-xl bg-slate-100 p-1">
        <TabsTrigger value="configTimetable" className={triggerClass}>
          <SlidersHorizontal className="size-4" /> Timings
        </TabsTrigger>
        <TabsTrigger value="editTimetable" className={triggerClass}>
          <LayoutGrid className="size-4" /> Subjects &amp; Grid
        </TabsTrigger>
      </TabsList>
      <TabsContent value="configTimetable">
        <TimetableConfig initialConfig={data} onSave={onSave} />
      </TabsContent>
      <TabsContent value="editTimetable">
        <TimetableEdit configData={data} onSave={onSave} />
      </TabsContent>
    </Tabs>
  );
}
