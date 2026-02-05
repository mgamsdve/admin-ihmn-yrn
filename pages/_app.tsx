import Navigationbar from "@/Components/NavigationBar";
import ProtectedRoute from "@/Components/ProtectedRoute";
import { AuthContextProvider } from "@/context/AuthContext";
import { ModernLayout } from "@/src/components/shell/ModernLayout";
import { ToastContainer } from "@/src/components/ui/Toast";
import { useToast } from "@/src/hooks/useToast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

const noAuthRequired = ["/Login"];
const noLayoutPages = ["/Login"];

function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthContextProvider>
      <ToastProvider>
        {noLayoutPages.includes(router.pathname) ? (
          // Login page - no layout
          noAuthRequired.includes(router.pathname) ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )
        ) : (
          // Other pages - with modern layout
          <ModernLayout>
            {noAuthRequired.includes(router.pathname) ? (
              <Component {...pageProps} />
            ) : (
              <ProtectedRoute>
                <Component {...pageProps} />
              </ProtectedRoute>
            )}
          </ModernLayout>
        )}
      </ToastProvider>
    </AuthContextProvider>
  );
}
