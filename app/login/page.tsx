import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <form className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password:</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="flex gap-3 mt-2">
                <button
                    formAction={login}
                    className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
                >
                    Log in
                </button>
                <button
                    formAction={signup}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-md px-4 py-2 font-medium hover:bg-gray-200 transition-colors"
                >
                    Sign up
                </button>
            </div>
        </form>
    )
}