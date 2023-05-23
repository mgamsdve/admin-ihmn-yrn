import UserCourses from '@/Components/UserCourses'
import UserInformation from '@/Components/UserInformation'

export default function UserDetail() {
    return (
        <div className="p-7 w-full h-screen overflow-y-scroll flex flex-col sm:flex-row md:space-x-8 space-y-3 md:space-y-0 bg-gray-50">
            <UserInformation />
            <UserCourses />
        </div>
    )
}
