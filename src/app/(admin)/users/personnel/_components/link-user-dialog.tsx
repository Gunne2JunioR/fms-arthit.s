"use client";

import { useState, useTransition } from "react";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import type { StaffProfileDto } from "@/features/directory";
import { linkUserAction, createUserFromPersonnelAction } from "@/features/directory/actions";
import { UserPlus, Link2, Unlink } from "lucide-react";

interface Props {
  personnel: StaffProfileDto | null;
  users: { id: string; name: string; email: string; googleEmail?: string | null }[];
  roles: { id: string; code: string; nameTh: string; nameEn: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkUserDialog({ personnel, users, roles, onClose, onSuccess }: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || "");
  const [mode, setMode] = useState<"link" | "create">("link");

  if (!personnel) return null;

  const handleLink = () => {
    startTransition(async () => {
      const res = await linkUserAction(personnel.id, selectedUserId || null);
      if (res.ok) {
        toast.success(t("personnel.linkSuccess"));
        onSuccess();
        onClose();
      } else {
        if (res.error.message.includes("user_already_linked")) {
          toast.error(t("personnel.userAlreadyLinkedError"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleUnlink = () => {
    startTransition(async () => {
      const res = await linkUserAction(personnel.id, null);
      if (res.ok) {
        toast.success(t("personnel.linkSuccess"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleCreateUser = () => {
    startTransition(async () => {
      const res = await createUserFromPersonnelAction(personnel.id, selectedRoleId);
      if (res.ok) {
        toast.success(t("personnel.userCreatedSuccess"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  return (
    <LiyonDialog open={!!personnel} onOpenChange={(open) => !open && onClose()}>
      <LiyonDialogHeader
        title={`${t("personnel.menuLink")} - ${personnel.fullNameTh}`}
        description={`${t("personnel.colCode")}: ${personnel.personnelCode}`}
      />
      <LiyonDialogBody>
        <div className="space-y-4 py-2">
          {/* Current Status */}
          <div className="p-3 rounded-lg border bg-muted/20 text-xs space-y-1">
            <span className="text-muted-foreground">{t("personnel.linkedAccount")}:</span>
            {personnel.user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{personnel.user.name}</p>
                  <p className="text-muted-foreground">{personnel.user.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7"
                  onClick={handleUnlink}
                  disabled={isPending}
                >
                  <Unlink className="h-3 w-3" />
                  {t("personnel.unlinkUser")}
                </Button>
              </div>
            ) : (
              <p className="font-medium text-foreground italic">{t("personnel.noLinkedAccount")}</p>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border p-1 bg-muted/40 text-xs">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                mode === "link" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("personnel.selectUser")}
            </button>
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                mode === "create" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("personnel.createAccountBtn")}
            </button>
          </div>

          {mode === "link" ? (
            <div className="space-y-3">
              <LiyonField label={t("personnel.selectUser")}>
                <LiyonSelect
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- เลือกบัญชีผู้ใช้ --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                {t("personnel.createAccountDesc")}
                <p className="mt-1 font-medium text-foreground">
                  อีเมล: {personnel.universityEmail || personnel.email}
                </p>
              </div>
              <LiyonField label={t("personnel.assignRole")}>
                <LiyonSelect
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameTh} ({r.code})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>
          )}
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        {mode === "link" ? (
          <Button onClick={handleLink} disabled={isPending || !selectedUserId}>
            <Link2 className="h-4 w-4 mr-1.5" />
            {t("personnel.menuLink")}
          </Button>
        ) : (
          <Button onClick={handleCreateUser} disabled={isPending || !selectedRoleId}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            {t("personnel.createAccountBtn")}
          </Button>
        )}
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
