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
            {/* Rota raiz redireciona para login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* ====================== */}
            {/* ROTAS DE ADMINISTRADOR */}
            {/* ====================== */}
            <Route path="/admin">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="students" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Students />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="instructors" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Instructors />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="workouts" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Workouts />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="attendance" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Attendance />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="financial" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Financial />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* ===================== */}
            {/* ROTAS DE INSTRUTOR */}
            {/* ===================== */}
            <Route path="/instructor">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="students" 
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorStudents />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="workouts" 
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorWorkouts />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* ================= */}
            {/* ROTAS DE ALUNO */}
            {/* ================= */}
            <Route path="/student">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentDashboard />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentDashboard />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="attendance" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentAttendance />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="finance" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentFinance />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="trainers" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentTrainers />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="workouts" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <StudentWorkouts />
                    </StudentLayout>
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Rota 404 - Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
