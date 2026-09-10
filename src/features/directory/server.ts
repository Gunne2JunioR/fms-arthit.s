import "server-only";

export {
  listStaffProfiles,
  listDepartments,
  type StaffProfileDto,
  type DepartmentDto,
} from "./_internal/services";
export { DIRECTORY_P, DIRECTORY_PERMISSIONS } from "./permissions";
