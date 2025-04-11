'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type CourseJoinButtonProps = {
  courseId: string;
  isMember: boolean;
  isCreator?: boolean;
};

export default function CourseJoinButton({ 
  courseId, 
  isMember, 
  isCreator = false 
}: CourseJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [memberStatus, setMemberStatus] = useState(isMember);
  const { toast } = useToast();
  const { status } = useSession();
  const router = useRouter();

  const handleJoinCourse = async () => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setMemberStatus(true);
        toast({
          title: 'Success',
          description: data.message || 'Successfully joined the course',
        });
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to join course');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to join course',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCourse = async () => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    if (isCreator) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Course creator cannot leave the course',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setMemberStatus(false);
        toast({
          title: 'Success',
          description: data.message || 'Successfully left the course',
        });
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to leave course');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to leave course',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreator) {
    return (
      <Button variant="secondary" disabled>
        Course Creator
      </Button>
    );
  }

  return memberStatus ? (
    <Button 
      variant="outline" 
      onClick={handleLeaveCourse} 
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Leave Course'}
    </Button>
  ) : (
    <Button 
      onClick={handleJoinCourse} 
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Join Course'}
    </Button>
  );
} 