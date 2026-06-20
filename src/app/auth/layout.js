export const metadata = {
  title: 'Nexus — Authenticate',
  description: 'Sign in or register to access the Nexus collective memory engine.',
};

export default function AuthLayout({ children }) {
  return (
    <div className="neo-theme min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient Knowledge Graph Background */}
      <div
        className="absolute inset-0 z-0 opacity-20 mix-blend-multiply bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCTiXyEhI2gJpQg1VX8HBRSWe7KZ4bUSeOjpYQxxhGj0oonnk-P-83s1qhTjvlPWEY3TVY82ytpymqNVm8v9EkAdH_dbl_SKDoWGLcyQuw_Vyq_nkwyTIMUDbv4W_Eek8nKAyDFEW9Ah1JilioPIkW4tZOz2fRcowUJpMHtmhuAwecHEBSoZ2883CTs6GW3AUgdGgFxmDMxbxMSh2A2Wl8ow7qgN55-VS7Hjl874ugRfr_-4SUuivXoMrQBkxlafp9NTF7G40s9BsE')",
        }}
      />
      <main className="relative z-10 w-full max-w-md px-4 md:px-0">
        {children}
      </main>
    </div>
  );
}
