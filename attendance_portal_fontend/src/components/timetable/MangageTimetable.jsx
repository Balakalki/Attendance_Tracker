import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TimetableConfig from "./TimetableConfig";
import TimetableEdit from "./TimetableEdit";

export default function ManageTimetable({data, onSave}) {
  return (
    <div>
      <Tabs defaultValue="configTimetable">
        <TabsList className={'w-full'}>
          <TabsTrigger value="configTimetable">Config Timetable</TabsTrigger>
          <TabsTrigger value="editTimetable">Add Timetable</TabsTrigger>
        </TabsList>
        <TabsContent value="configTimetable">
          <TimetableConfig initialConfig={data} onSave={onSave}/>
        </TabsContent>
        <TabsContent value="editTimetable">
          <TimetableEdit configData={data} onSave={onSave}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
