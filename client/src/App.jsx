import { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackModal from "./components/FeedbackModal";
import Home from "./pages/Home";
import Templates from "./pages/Templates";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SubmitTemplate from "./pages/SubmitTemplate";
import AdminReviews from "./pages/AdminReviews";
import Collections from "./pages/Collections";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { token, user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ivory dark:bg-[#0e0e13]">
      <Navbar />
      <ScrollToTop />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitTemplate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <AdminReviews />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="border-t border-stone-200 bg-white dark:border-white/10 dark:bg-stone-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
             <div className="col-span-2 sm:col-span-1">
               <div className="flex items-center gap-2.5">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
                   T
                 </span>
                 <span className="font-bold text-stone-800 dark:text-stone-100">
                   Template
                   <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                     Store
                   </span>
                 </span>
               </div>
               <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                 Hand-picked HTML templates for landing pages, dashboards,
                 portfolios, online stores and more — browse, preview, save.
               </p>
             </div>

             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                 Explore
               </h3>
               <ul className="mt-3 space-y-2 text-sm">
                 {[
                   { label: "Home", to: "/" },
                   { label: "Templates", to: "/templates" },
                   ...(token ? [{ label: "Submit a template", to: "/submit" }] : []),
                   ...(token ? [{ label: "My collections", to: "/collections" }] : []),
                   ...(user?.role === "admin"
                     ? [{ label: "Review queue", to: "/admin/reviews" }]
                     : []),
                   ...(token
                     ? [{ label: "Favorites", to: "/favorites" }]
                     : [{ label: "Login", to: "/login" }]),
                 ].map((l) => (
                   <li key={l.to}>
                     <Link
                       to={l.to}
                       className="link-draw font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                     >
                       {l.label}
                     </Link>
                   </li>
                 ))}
                 </ul>
               </div>

             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                 Categories
               </h3>
               <ul className="mt-3 space-y-2 text-sm">
                 {[
                   "Landing Page",
                   "Dashboard",
                   "Portfolio",
                   "E-commerce",
                   "Blog",
                   "Business",
                 ].map((c) => (
                   <li key={c}>
                     <Link
                       to={`/templates?category=${encodeURIComponent(c)}`}
                       className="link-draw font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                     >
                       {c}
                     </Link>
                   </li>
                 ))}
                </ul>
               </div>

               <div className="sm:hidden">
                 <button
                   onClick={() => setFeedbackOpen(true)}
                   className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 hover:ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/25"
                   aria-label="Open feedback form"
                 >
                   <svg
                     width="15"
                     height="15"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     aria-hidden="true"
                   >
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                   </svg>
                   Give feedback
                 </button>
                 <p className="mt-2 max-w-[180px] text-xs text-stone-400 dark:text-stone-500">
                   Something not right? Tell us — we read every message.
                 </p>
               </div>

               <div>
                 <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                   Contact
                 </h3>
                 <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
                   <li>
                     <a
                       href="mailto:hello@templatestore.dev"
                       className="link-draw font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                     >
                       hello@templatestore.dev
                     </a>
                   </li>
                   <li className="max-w-[220px] leading-relaxed">
                     A Mini SaaS Template Store — built with React, Tailwind CSS
                     and Express.
                   </li>
                    <li className="hidden lg:block lg:mt-3">
                     <button
                       onClick={() => setFeedbackOpen(true)}
                       className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 hover:ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/25"
                       aria-label="Open feedback form"
                     >
                       <svg
                         width="15"
                         height="15"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         aria-hidden="true"
                       >
                         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                       </svg>
                       Give feedback
                     </button>
                     <p className="mt-2 max-w-[180px] text-xs text-stone-400 dark:text-stone-500">
                       Something not right? Tell us — we read every message.
                     </p>
                   </li>
                 </ul>
               </div>
             </div>

           <div className="mt-10 flex flex-row items-center justify-between gap-2 border-t border-stone-200 pt-6 text-xs text-stone-400 dark:border-white/10 dark:text-stone-500">
             <p>© {new Date().getFullYear()} TemplateStore · All rights reserved.</p>
             <p>Mini SaaS Template Store</p>
           </div>
         </div>
       </footer>

       {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
     </div>
  );
}
