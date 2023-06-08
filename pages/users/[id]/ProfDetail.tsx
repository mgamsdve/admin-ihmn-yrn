import ProfCourses from "@/Components/ProfCourses";
import ProfInformation from "@/Components/ProfInformation";

export default function ProfDetail() {
  return (
    <div className="p-7 w-full h-screen overflow-y-scroll flex flex-col sm:flex-row md:space-x-8 space-y-3 md:space-y-0 bg-gray-50">
      <ProfInformation />
      <ProfCourses />
    </div>
  );
}
