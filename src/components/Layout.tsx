import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}