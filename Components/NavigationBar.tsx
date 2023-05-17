'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BsArrowLeftShort } from 'react-icons/bs'
import { FiUsers } from 'react-icons/fi'
import { AiOutlineReconciliation, AiOutlineHome } from 'react-icons/ai'
import { FaCircleNotch } from 'react-icons/fa'
import { MdOutlineContactPhone } from 'react-icons/md'
import { BiLogOut } from 'react-icons/bi'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { useAuth } from '@/context/AuthContext'
function Navigationbar() {
    const [open, setOpen] = useState(true)
    const { logout } = useAuth()
    const Menus = [
        {
            title: 'Home',
            to: '/',
            icon: (
                <AiOutlineHome className=" origin-left font-medium text-lg ml-2" />
            ),
        },
        {
            title: 'Students',
            to: '/StudentPages',
            icon: <FiUsers className=" origin-left font-medium text-lg ml-2" />,
        },
        {
            title: 'Courses',
            to: '/CoursesPage',
            icon: (
                <AiOutlineReconciliation className=" origin-left font-medium text-lg ml-2" />
            ),
        },
        {
            title: 'Professors',
            to: '/ProfPage',
            icon: (
                <HiOutlineUserGroup className=" origin-left font-medium text-lg ml-2" />
            ),
        },
        {
            title: 'Evaluation',
            to: '/evaluations',
            icon: (
                <FaCircleNotch className=" origin-left font-medium text-lg ml-2" />
            ),
        },
        {
            title: 'Contact',
            to: '/contacts',
            icon: (
                <MdOutlineContactPhone className=" origin-left font-medium text-lg ml-2" />
            ),
        },
    ]

    async function signOut() {
        await logout()
    }
    return (
        <div
            className={` h-screen p-5 pt-8 border-b-8  border-blue-900 ${
                open ? 'w-60' : 'w-20'
            } duration-300 relative rounded-e-sm`}
        >
            <BsArrowLeftShort
                className={`bg-white text-slate-600 rounded-full text-3xl absolute top-9 -right-3 border border-slate-600 cursor-pointer ${
                    !open && 'rotate-180'
                }`}
                onClick={() => setOpen(!open)}
            />
            <div className="flex absolute">
                <img
                    src="/ihmnIcon.ico"
                    alt="icon"
                    className="rounded-full w-10 h-10 "
                />
            </div>
            <h1
                className={`text-gray-600 origin-left font-medium text-2xl ml-2 text-center mt-2 ${
                    !open && 'scale-0'
                }`}
            >
                Ihmn
            </h1>
            <div className="pt-2 space-y-2 mt-10 ">
                <h1
                    className={`text-gray-400  font-medium text-2xl ml-2  ${
                        !open && 'scale-0'
                    }`}
                >
                    Manage
                </h1>
                <ul className="">
                    {Menus.map((menu) => {
                        return (
                            <Link href={menu.to} key={menu.title}>
                                <div
                                    className={`${
                                        open && 'hover:bg-blue-50'
                                    } rounded-md text-blue-800 ${
                                        !open && 'hover:text-blue-300'
                                    } ${open && 'p-2'} duration-200`}
                                >
                                    {menu.icon}

                                    <li
                                        className={`origin-left font-medium text-lg ml-2 ${
                                            !open && 'scale-0'
                                        }`}
                                    >
                                        {menu.title}
                                    </li>
                                </div>
                            </Link>
                        )
                    })}
                </ul>
            </div>
            <button
                className={`text-red-600 rounded-md absolute bottom-5 left-5 flex flex-row space-x-2 text-xl ${
                    open && 'hover:bg-red-100'
                } ${!open && 'hover:text-red-300'}  p-2 duration-300`}
                onClick={signOut}
            >
                <BiLogOut className="mt-1" />
                <span className={`${!open && 'scale-0'} ml-2`}>Logout</span>
            </button>
        </div>
    )
}

export default Navigationbar
