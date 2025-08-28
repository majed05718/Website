'use client';

import { createContext, useContext } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

interface SupabaseContextType {
	supabase: ReturnType<typeof getSupabaseClient>;
}

const SupabaseContext = createContext<SupabaseContextType>({ supabase: getSupabaseClient() });

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
	return (
		<SupabaseContext.Provider value={{ supabase: getSupabaseClient() }}>
			{children}
		</SupabaseContext.Provider>
	);
}

export const useSupabase = () => {
	const context = useContext(SupabaseContext);
	if (!context) {
		throw new Error('useSupabase must be used within a SupabaseProvider');
	}
	return context;
};
