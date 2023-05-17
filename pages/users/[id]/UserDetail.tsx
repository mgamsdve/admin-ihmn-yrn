import UserCourses from '@/Components/UserCourses'
import UserInformation from '@/Components/UserInformation'

export default function UserDetail() {
    return (
        <div className="p-7 sm:p-14  w-full h-screen overflow-y-auto flex flex-col sm:flex-row space-x-8 bg-gray-50">
            <UserInformation />
            <UserCourses />
        </div>
    )
}
