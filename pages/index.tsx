export default function Home() {
    return (
        <div className="flex flex-col space-y-10 bg-gray-50 p-7 w-full h-screen text-4xl font-bold overflow-y-auto ">
            <div className="flex flex-row space-x-10">
                <div className="shadow-xl p-7 w-[50%] h-96 bg-white rounded-xl">
                    HOME
                </div>
                <div className="shadow-xl p-7 w-full h-96 bg-white rounded-xl"></div>
            </div>
            <div>
                <div className="shadow-xl p-7 w-full h-[500px] bg-white rounded-xl"></div>
            </div>
        </div>
    )
}
