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
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { StaffProfileDto, DepartmentDto, PersonnelType, EmploymentStatus } from "@/features/directory";
import { createStaffAction, updateStaffAction } from "@/features/directory/actions";
import { uploadAvatarAction } from "@/features/identity/actions";
import { User, Building, Mail, Shield, Upload, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: StaffProfileDto | null;
  departments: DepartmentDto[];
  users: { id: string; name: string; email: string }[];
  onSuccess: () => void;
}

export function PersonnelDialog({
  open,
  onOpenChange,
  personnel,
  departments,
  users,
  onSuccess,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "contact" | "account">("personal");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Form States - 1. Personal
  const [personnelCode, setPersonnelCode] = useState(personnel?.personnelCode || "");
  const [prefix, setPrefix] = useState(personnel?.prefix || "อาจารย์ ดร.");
  const [firstNameTh, setFirstNameTh] = useState(personnel?.firstNameTh || "");
  const [lastNameTh, setLastNameTh] = useState(personnel?.lastNameTh || "");
  const [firstNameEn, setFirstNameEn] = useState(personnel?.firstNameEn || "");
  const [lastNameEn, setLastNameEn] = useState(personnel?.lastNameEn || "");
  const [gender, setGender] = useState(personnel?.gender || "male");
  const [birthDate, setBirthDate] = useState(personnel?.birthDate || "");
  const [citizenId, setCitizenId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(personnel?.avatarUrl || "");

  // Form States - 2. Employment
  const [departmentId, setDepartmentId] = useState(personnel?.departmentId || departments[0]?.id || "");
  const [subDepartmentName, setSubDepartmentName] = useState(personnel?.subDepartmentName || "");
  const [personnelType, setPersonnelType] = useState<StaffProfileDto["personnelType"]>(personnel?.personnelType || "ACADEMIC");
  const [employmentStatus, setEmploymentStatus] = useState<StaffProfileDto["employmentStatus"]>(personnel?.employmentStatus || "ACTIVE");
  const [positionName, setPositionName] = useState(personnel?.positionName || "อาจารย์ประจำ");
  const [academicPosition, setAcademicPosition] = useState(personnel?.academicPosition || "");
  const [workLocation, setWorkLocation] = useState(personnel?.workLocation || "");
  const [startDate, setStartDate] = useState(personnel?.startDate || "");
  const [endDate, setEndDate] = useState(personnel?.endDate || "");
  const [retirementDate, setRetirementDate] = useState(personnel?.retirementDate || "");

  // Form States - 3. Contact
  const [universityEmail, setUniversityEmail] = useState(personnel?.universityEmail || personnel?.email || "");
  const [personalEmail, setPersonalEmail] = useState(personnel?.personalEmail || "");
  const [phoneNumber, setPhoneNumber] = useState(personnel?.phoneNumber || "");
  const [phoneExt, setPhoneExt] = useState(personnel?.phoneExt || "");

  // Form States - 4. Account Link
  const [userId, setUserId] = useState(personnel?.userId || "");

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("personnel.avatarHint"));
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAvatarAction(formData);
    setIsUploading(false);

    if (res.ok) {
      setAvatarUrl(res.data.url);
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    } else {
      toast.error(res.error.message || "อัปโหลดล้มเหลว");
    }
  };

  const handleSubmit = () => {
    if (!personnelCode.trim() || !firstNameTh.trim() || !lastNameTh.trim() || !departmentId) {
      toast.error("กรุณากรอกข้อมูลบังคับให้ครบถ้วน");
      return;
    }

    startTransition(async () => {
      const payload = {
        departmentId,
        personnelCode: personnelCode.trim(),
        prefix: prefix.trim(),
        firstNameTh: firstNameTh.trim(),
        lastNameTh: lastNameTh.trim(),
        firstNameEn: firstNameEn.trim(),
        lastNameEn: lastNameEn.trim(),
        academicTitleTh: prefix.trim(),
        academicTitleEn: firstNameEn ? "Lecturer" : "",
        gender,
        birthDate: birthDate || null,
        citizenId: citizenId.trim() || null,
        personnelType,
        employmentStatus,
        subDepartmentName: subDepartmentName.trim() || null,
        positionName: positionName.trim(),
        academicPosition: academicPosition.trim() || null,
        email: (universityEmail || `${personnelCode}@fms.ac.th`).toLowerCase().trim(),
        universityEmail: universityEmail.trim() || null,
        personalEmail: personalEmail.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        phoneExt: phoneExt.trim() || null,
        workLocation: workLocation.trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        retirementDate: retirementDate || null,
        avatarUrl: avatarUrl.trim() || null,
        userId: userId || null,
      };

      if (personnel) {
        const res = await updateStaffAction({ id: personnel.id, ...payload });
        if (res.ok) {
          toast.success(t("personnel.saveSuccess"));
          onSuccess();
          onOpenChange(false);
        } else {
          if (res.error.message.includes("personnel_code_exists")) {
            toast.error(t("personnel.codeExistsError"));
          } else if (res.error.message.includes("user_already_linked")) {
            toast.error(t("personnel.userAlreadyLinkedError"));
          } else {
            toast.error(res.error.message || t("common.error"));
          }
        }
      } else {
        const res = await createStaffAction(payload);
        if (res.ok) {
          toast.success(t("personnel.saveSuccess"));
          onSuccess();
          onOpenChange(false);
        } else {
          if (res.error.message.includes("personnel_code_exists")) {
            toast.error(t("personnel.codeExistsError"));
          } else if (res.error.message.includes("user_already_linked")) {
            toast.error(t("personnel.userAlreadyLinkedError"));
          } else {
            toast.error(res.error.message || t("common.error"));
          }
        }
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogHeader
        title={personnel ? t("personnel.menuEdit") : t("personnel.addBtn")}
        description={t("personnel.subtitle")}
      />
      <LiyonDialogBody>
        <div className="space-y-4 py-2">
          {/* Tabs Navigation */}
          <div className="flex border-b overflow-x-auto gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`pb-2 px-3 font-medium flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "personal"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              {t("personnel.tabPersonalInfo")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("employment")}
              className={`pb-2 px-3 font-medium flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "employment"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              {t("personnel.tabEmployment")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`pb-2 px-3 font-medium flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "contact"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              {t("personnel.tabContact")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`pb-2 px-3 font-medium flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "account"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              {t("personnel.tabAccount")}
            </button>
          </div>

          {/* Tab 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border bg-muted/10">
                <div className="h-20 w-20 rounded-full border bg-background overflow-hidden flex items-center justify-center text-primary font-bold text-2xl relative shadow-xs">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-foreground">{t("personnel.avatar")}</p>
                  <p className="text-[11px] text-muted-foreground">{t("personnel.avatarHint")}</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted cursor-pointer transition-colors shadow-2xs mt-1">
                    <Upload className="h-3.5 w-3.5" />
                    <span>เลือกไฟล์รูปภาพ</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LiyonField label={t("personnel.colCode")}>
                  <input
                    type="text"
                    value={personnelCode}
                    onChange={(e) => setPersonnelCode(e.target.value)}
                    placeholder="เช่น PERS-00123"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background font-mono font-medium"
                    required
                  />
                </LiyonField>
                <LiyonField label={t("personnel.prefix")}>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="เช่น ดร., ผศ.ดร., นาย"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.gender")}>
                  <LiyonSelect value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">{t("personnel.gender.male")}</option>
                    <option value="female">{t("personnel.gender.female")}</option>
                    <option value="other">{t("personnel.gender.other")}</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.firstNameTh")}>
                  <input
                    type="text"
                    value={firstNameTh}
                    onChange={(e) => setFirstNameTh(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                    required
                  />
                </LiyonField>
                <LiyonField label={t("personnel.lastNameTh")}>
                  <input
                    type="text"
                    value={lastNameTh}
                    onChange={(e) => setLastNameTh(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                    required
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.firstNameEn")}>
                  <input
                    type="text"
                    value={firstNameEn}
                    onChange={(e) => setFirstNameEn(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.lastNameEn")}>
                  <input
                    type="text"
                    value={lastNameEn}
                    onChange={(e) => setLastNameEn(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.birthDate")}>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.citizenId")}>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="เลขประจำตัว 13 หลัก (เข้ารหัสปลอดภัย)"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background font-mono"
                  />
                </LiyonField>
              </div>
            </div>
          )}

          {/* Tab 2: Employment Details */}
          {activeTab === "employment" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.colDept")}>
                  <LiyonSelect
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {locale === "en" ? d.nameEn : d.nameTh} ({d.code})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
                <LiyonField label={t("personnel.subDept")}>
                  <input
                    type="text"
                    value={subDepartmentName}
                    onChange={(e) => setSubDepartmentName(e.target.value)}
                    placeholder="เช่น สาขาวิทยาการข้อมูล, ฝ่ายแผนงาน"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.colType")}>
                  <LiyonSelect
                    value={personnelType}
                    onChange={(e) => setPersonnelType(e.target.value as PersonnelType)}
                  >
                    <option value="EXECUTIVE">{t("personnel.type.EXECUTIVE")}</option>
                    <option value="ACADEMIC">{t("personnel.type.ACADEMIC")}</option>
                    <option value="SUPPORT">{t("personnel.type.SUPPORT")}</option>
                    <option value="CONTRACT">{t("personnel.type.CONTRACT")}</option>
                    <option value="OTHER">{t("personnel.type.OTHER")}</option>
                  </LiyonSelect>
                </LiyonField>
                <LiyonField label={t("personnel.colStatus")}>
                  <LiyonSelect
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                  >
                    <option value="ACTIVE">{t("personnel.status.ACTIVE")}</option>
                    <option value="ON_LEAVE_STUDY">{t("personnel.status.ON_LEAVE_STUDY")}</option>
                    <option value="ON_LEAVE_SICK">{t("personnel.status.ON_LEAVE_SICK")}</option>
                    <option value="RETIRED">{t("personnel.status.RETIRED")}</option>
                    <option value="TERMINATED">{t("personnel.status.TERMINATED")}</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.positionName")}>
                  <input
                    type="text"
                    value={positionName}
                    onChange={(e) => setPositionName(e.target.value)}
                    placeholder="เช่น อาจารย์, นักวิชาการศึกษา, เจ้าหน้าที่ธุรการ"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                    required
                  />
                </LiyonField>
                <LiyonField label={t("personnel.academicPosition")}>
                  <input
                    type="text"
                    value={academicPosition}
                    onChange={(e) => setAcademicPosition(e.target.value)}
                    placeholder="เช่น ผู้ช่วยศาสตราจารย์, รองศาสตราจารย์"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LiyonField label={t("personnel.startDate")}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.endDate")}>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.retirementDate")}>
                  <input
                    type="date"
                    value={retirementDate}
                    onChange={(e) => setRetirementDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
              </div>

              <LiyonField label={t("personnel.workLocation")}>
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="เช่น อาคาร 1 ห้อง 305"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>
          )}

          {/* Tab 3: Contact */}
          {activeTab === "contact" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.universityEmail")}>
                  <input
                    type="email"
                    value={universityEmail}
                    onChange={(e) => setUniversityEmail(e.target.value)}
                    placeholder="name@university.ac.th"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.personalEmail")}>
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="personal@gmail.com"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("personnel.phoneNumber")}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="081-xxx-xxxx"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background font-mono"
                  />
                </LiyonField>
                <LiyonField label={t("personnel.phoneExt")}>
                  <input
                    type="text"
                    value={phoneExt}
                    onChange={(e) => setPhoneExt(e.target.value)}
                    placeholder="เช่น 1234"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background font-mono"
                  />
                </LiyonField>
              </div>
            </div>
          )}

          {/* Tab 4: Account Link */}
          {activeTab === "account" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <LiyonField label={t("personnel.linkedAccount")}>
                <LiyonSelect
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  <option value="">-- {t("personnel.noLinkedAccount")} --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <div className="p-3 rounded-lg border bg-muted/20 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">หมายเหตุ:</p>
                <p>• บุคลากร 1 คน เชื่อมกับบัญชีผู้ใช้ระบบได้สูงสุด 1 บัญชี</p>
                <p>• ผู้ใช้ระบบ 1 บัญชี เชื่อมกับบุคลากรได้สูงสุด 1 คน</p>
                <p>• หากยังไม่มีบัญชีผู้ใช้ สามารถกดบันทึกข้อมูลบุคลากรก่อน แล้วเลือกคำสั่ง &quot;สร้างบัญชีผู้ใช้จากบุคลากร&quot; ได้ในเมนูจุดสามจุด</p>
              </div>
            </div>
          )}
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || isUploading}>
          {t("common.save")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
