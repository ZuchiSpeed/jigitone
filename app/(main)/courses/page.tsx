import { getCourses } from "@/db/queries";
import { List } from "./list";

// Async server component that fetches and displays courses
const CoursesPage = async () => {
  // Fetch courses data from the database (server-side)
  const courses = await getCourses();

  return (
    <div className="h-full px-3 mx-auto max-w-[912px]">
      <h1 className="text-2xl font-bold text-neutral-700">Language Courses</h1>
      {/* Render the List component with fetched courses data */}
      <List courses={courses} activeCourseId={2} />
    </div>
  );
};

export default CoursesPage;
