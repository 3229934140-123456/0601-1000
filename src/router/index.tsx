import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import AssetList from '@/pages/AssetList';
import Warehousing from '@/pages/Warehousing';
import Usage from '@/pages/Usage';
import Transfer from '@/pages/Transfer';
import Maintenance from '@/pages/Maintenance';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import Scrap from '@/pages/Scrap';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Navigate to="/assets" replace />
      </Layout>
    ),
  },
  {
    path: '/assets',
    element: (
      <Layout>
        <AssetList />
      </Layout>
    ),
  },
  {
    path: '/warehousing',
    element: (
      <Layout>
        <Warehousing />
      </Layout>
    ),
  },
  {
    path: '/usage',
    element: (
      <Layout>
        <Usage />
      </Layout>
    ),
  },
  {
    path: '/transfer',
    element: (
      <Layout>
        <Transfer />
      </Layout>
    ),
  },
  {
    path: '/maintenance',
    element: (
      <Layout>
        <Maintenance />
      </Layout>
    ),
  },
  {
    path: '/inventory',
    element: (
      <Layout>
        <Inventory />
      </Layout>
    ),
  },
  {
    path: '/reports',
    element: (
      <Layout>
        <Reports />
      </Layout>
    ),
  },
  {
    path: '/scrap',
    element: (
      <Layout>
        <Scrap />
      </Layout>
    ),
  },
]);
