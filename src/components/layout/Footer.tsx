// Footer component for the application

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-600">
            © 2025 Teknik Servis Otomasyonu. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Servis Takip Sistemi</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
