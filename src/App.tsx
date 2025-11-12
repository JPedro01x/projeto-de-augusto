import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Instructors from "./pages/admin/Instructors";
import Workouts from "./pages/admin/Workouts";
import Attendance from "./pages/admin/Attendance";
import Financial from "./pages/admin/Financial";
import Settings from "./pages/admin/Settings";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorStudents from "./pages/instructor/Students";
import InstructorWorkouts from "./pages/instructor/Workouts";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentFinance from "./pages/student/Finance";
import StudentLayout from "./components/StudentLayout";
import StudentTrainers from "./pages/student/Trainers";
import StudentWorkouts from "./pages/student/Workouts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/instructors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Instructors />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workouts"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Workouts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Attendance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/financial"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Financial />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Instructor Routes */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Layout>
                    <InstructorDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/students"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Layout>
                    <InstructorStudents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/workouts"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Layout>
                    <InstructorWorkouts />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/finance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentFinance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/trainers"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentTrainers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/workouts"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentWorkouts />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
