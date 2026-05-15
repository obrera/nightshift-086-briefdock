import { UiErrorBoundary } from '@workspace/ui/components/ui-error-boundary'
import { UiLoaderFull } from '@workspace/ui/components/ui-loader-full'
import { createBrowserRouter, Navigate, type RouteObject, RouterProvider } from 'react-router'
import { BriefdockFeatureEntry } from './briefdock/briefdock-feature-entry.tsx'
import { rootRouteLoader } from './data-access/root-route-loader.tsx'

function createRouter() {
  return createBrowserRouter([
    {
      children: getAppRoutes(),
      errorElement: <UiErrorBoundary />,
      hydrateFallbackElement: <UiLoaderFull />,
      id: 'root',
      loader: rootRouteLoader(),
    },
  ])
}

function getAppRoutes(): RouteObject[] {
  return [
    { element: <Navigate replace to="/desk" />, index: true },
    { element: <BriefdockFeatureEntry />, path: 'desk' },
    { element: <Navigate replace to="/desk" />, path: '*' },
  ]
}

export function ShellRoutes() {
  return <RouterProvider router={createRouter()} />
}
