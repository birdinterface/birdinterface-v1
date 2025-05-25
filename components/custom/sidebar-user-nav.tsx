'use client';

import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { User } from "next-auth";
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useModal } from '../context/modal-context';

interface ExtendedUser extends User {
  membership?: string;
}

// Extract the modal content into a separate component
export function SidebarUserNavContent({ user }: { user: ExtendedUser }) {
  const [selectedPlan, setSelectedPlan] = useState(user.membership || 'free');
  const currentMembership = user.membership || 'free';

  const togglePlan = () => {
    if (currentMembership === 'free') {
      const newPlan = selectedPlan === 'free' ? 'pro' : 'free';
      setSelectedPlan(newPlan);
    } else if (currentMembership === 'ultimate' || currentMembership === 'pro') {
      const newPlan = selectedPlan === 'pro' ? 'ultimate' : 'pro';
      setSelectedPlan(newPlan);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  const handleSubscriptionChange = async (newPlan: string) => {
    try {
      // First, cancel existing subscription if any
      if (currentMembership !== 'free') {
        await fetch('/api/stripe/cancel-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });
      }

      // Then redirect to new subscription checkout
      if (newPlan === 'pro') {
        window.location.href = `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY}?client_reference_id=${user.id}`;
      } else if (newPlan === 'ultimate') {
        window.location.href = `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ULTIMATE}?client_reference_id=${user.id}`;
      }
    } catch (error) {
      console.error('Failed to handle subscription change:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-semibold mb-6">
        {currentMembership === 'ultimate' ? 'Your Plan' : 'Upgrade your plan'}
      </h2>
      <div className="mb-6">
        <div 
          className="relative inline-flex items-center cursor-pointer w-[160px] h-8"
          onClick={togglePlan}
        >
          <div className={`w-full h-full bg-gray-100 border border-gray-300 rounded-full dark:bg-[#282b2e] dark:border-gray-700`}>
            <div className={`absolute top-1/2 left-[4px] transform -translate-y-1/2 bg-[#d3dee8] rounded-full h-6 w-[76px] transition-all ${
              selectedPlan === (currentMembership === 'free' ? 'pro' : 'ultimate') ? 'translate-x-[76px]' : ''
            } dark:bg-[#3a3f43]`}></div>
          </div>
          <span className={`absolute left-0 w-[80px] text-xs font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-200 ease-in ${
            selectedPlan === (currentMembership === 'free' ? 'free' : 'pro') ? 'opacity-100' : 'opacity-50'
          } flex items-center justify-center h-full`}>
            {currentMembership === 'free' ? 'Free' : 'Pro'}
          </span>
          <span className={`absolute right-0 w-[80px] text-xs font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-200 ease-in ${
            selectedPlan === (currentMembership === 'free' ? 'pro' : 'ultimate') ? 'opacity-100' : 'opacity-50'
          } flex items-center justify-center h-full`}>
            {currentMembership === 'free' ? 'Pro' : 'Ultimate'}
          </span>
        </div>
      </div>
      <div className={`w-full sm:w-[400px] border rounded-lg p-4 sm:p-6 flex flex-col bg-white dark:bg-[#000000] ${
        selectedPlan === currentMembership 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-700'
      }`}>
        <div className="flex justify-left mb-2">
          <Image
            src="/images/logodark.png"
            alt="Logo"
            width={150}
            height={30}
            className="dark:hidden"
            draggable={false}
          />
          <Image
            src="/images/logowhite.png"
            alt="Logo"
            width={150}
            height={30}
            className="hidden dark:block"
            draggable={false}
          />
        </div>
        <div className="text-left mb-6">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
          </h3>
          <p className="text-xl text-gray-900 dark:text-white">
            ${selectedPlan === 'free' ? '0 ' : selectedPlan === 'pro' ? '15 ' : '25 '}
            <span className="text-sm text-[#000000] dark:text-white">/ month</span>
          </p>
        </div>
        <button 
          className={`w-full px-6 py-3 mb-6 rounded-full text-base font-medium transition-colors border ${
            selectedPlan === currentMembership
              ? 'bg-gray-300 text-gray-500 dark:bg-[#616161] dark:text-gray-400 cursor-not-allowed'
              : 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 border-gray-300 dark:border-gray-600'
          }`}
          disabled={selectedPlan === currentMembership}
          onClick={() => {
            if (selectedPlan !== currentMembership) {
              handleSubscriptionChange(selectedPlan);
            }
          }}
        >
          {selectedPlan === currentMembership 
            ? 'Your current plan' 
            : selectedPlan === 'pro' && currentMembership === 'ultimate'
              ? `Downgrade to Pro`
              : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`
          }
        </button>
        <ul className="text-base mb-6 text-left w-full text-gray-700 dark:text-white">
          {selectedPlan === 'free' ? (
            <>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Full functionality
              </li>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Runs on Grok from xAI
              </li>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Prompt engineered
              </li>
            </>
          ) : selectedPlan === 'pro' ? (
            <>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Everything in Free
              </li>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Much more usage
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Early access to newest AI features
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Everything in Pro
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Unlimited usage
              </li>
            </>
          )}
        </ul>
        {(currentMembership === 'pro' || currentMembership === 'ultimate') && 
         selectedPlan === currentMembership && (
          <button 
            onClick={handleManageSubscription}
            className="text-gray-500 mb-3 dark:text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors text-left w-full"
          >
            Manage my subscription
          </button>
        )}
      </div>
    </div>
  );
}

// Keep the sidebar navigation separate
export function SidebarUserNav({ user }: { user: ExtendedUser }) {
  const { setTheme, theme } = useTheme();
  const { openModal } = useModal();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 hover:bg-sidebar-accent [@media(hover:none)]:hover:bg-transparent">
              <Image
                src={user.image || `https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
                draggable={false}
              />
              <span>{user?.name || user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem asChild>
              <button
                className="w-full text-left"
                onClick={openModal}
              >
                Your Plan
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                className="w-full text-left"
                onClick={() => {
                  signOut({
                    redirect: true,
                    callbackUrl: '/',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
