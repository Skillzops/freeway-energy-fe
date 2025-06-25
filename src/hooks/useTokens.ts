import Cookies from "js-cookie";

const useTokens = () => {
  // Safely get and parse userData from cookies
  const userData = Cookies.get("userData");
  try {
    const parsedData = userData ? JSON.parse(userData) : null;
    // Safely access token and other properties
    return {
      token: parsedData?.token,
      createdAt: parsedData?.createdAt,
      deletedAt: parsedData?.deletedAt,
      email: parsedData?.email,
      firstname: parsedData?.firstname,
      id: parsedData?.id,
      isBlocked: parsedData?.isBlocked,
      lastLogin: parsedData?.lastLogin,
      lastname: parsedData?.lastname,
      location: parsedData?.location,
      phone: parsedData?.phone,
      role: {
        active: parsedData?.role?.active,
        created_at: parsedData?.role?.created_at,
        deleted_at: parsedData?.role?.deleted_at,
        id: parsedData?.role?.id,
        permissionIds: parsedData?.role?.permissionIds,
        permissions: parsedData?.role?.permissions,
        role: parsedData?.role?.role,
        updated_at: parsedData?.role?.updated_at,
      },
      roleId: parsedData?.roleId,
      staffId: parsedData?.staffId,
      status: parsedData?.status,
      updatedAt: parsedData?.updatedAt,
      username: parsedData?.username,
    };
  } catch (error) {
    console.error("Error parsing userData cookie:", error);
    return {
      token: undefined,
      createdAt: undefined,
      deletedAt: undefined,
      email: undefined,
      firstname: undefined,
      id: undefined,
      isBlocked: undefined,
      lastLogin: undefined,
      lastname: undefined,
      location: undefined,
      phone: undefined,
      role: {
        active: undefined,
        created_at: undefined,
        deleted_at: undefined,
        id: undefined,
        permissionIds: undefined,
        permissions: undefined,
        role: undefined,
        updated_at: undefined,
      },
      roleId: undefined,
      staffId: undefined,
      status: undefined,
      updatedAt: undefined,
      username: undefined,
    };
  }
};

export default useTokens;