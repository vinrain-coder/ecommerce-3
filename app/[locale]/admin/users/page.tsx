"use client";

import { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/db/models/user.model";
import { formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Users",
};

export default async function AdminUser(props: {
  searchParams: Promise<{ page: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (session?.user.role !== "Admin")
    throw new Error("Admin permission required");

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const users = await getAllUsers({ page, search });

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(search);

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("search", searchTerm);
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <h1 className="h1-bold">Users</h1>
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.data.map((user: IUser) => (
              <TableRow key={user._id}>
                <TableCell>{formatId(user._id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${user._id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user._id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users?.totalPages > 1 && (
          <Pagination page={page} totalPages={users?.totalPages} />
        )}
      </div>
    </div>
  );
}
