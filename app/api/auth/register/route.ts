import { NextRequest, NextResponse } from "next/server";
import {
  UserRole,
  RegistrationStatus,
  IRegistrationApplication,
  PharmacyOwnerRegistrationSchema,
  RetailPharmacyRegistrationSchema,
  PharmaCompanyRegistrationSchema,
  DistributorRegistrationSchema,
  SalesRepRegistrationSchema,
} from "@/types/domain";

// In-Memory Persistent Store for Registration Applications
let applications: IRegistrationApplication[] = [
  {
    id: "reg-seed-01",
    trackingNumber: "REG-2026-881920",
    role: UserRole.PHARMACY_OWNER,
    status: RegistrationStatus.PENDING_VERIFICATION,
    createdAt: "2026-10-15T09:30:00Z",
    updatedAt: "2026-10-15T14:20:00Z",
    isPhoneVerified: true,
    isEmailVerified: true,
    shopName: "Al-Madina Pharmacy & Dispensary",
    ownerName: "Dr. Kamrul Hasan",
    phone: "01712345678",
    email: "almadina.med@gmail.com",
    nidNumber: "1988269123456",
    tradeLicenseNo: "TRAD/DSCC/094821/2024",
    tinNumber: "782910482910",
    address: "Holding 42, Road 7, Sector 3, Uttara",
    thana: "Uttara",
    district: "Dhaka",
    latitude: 23.8759,
    longitude: 90.3795,
    documents: [
      {
        id: "doc-01",
        type: "TRADE_LICENSE",
        fileName: "trade_license_2024.pdf",
        fileSize: 1024 * 450,
        mimeType: "application/pdf",
        uploadedAt: "2026-10-15T09:30:00Z",
      },
      {
        id: "doc-02",
        type: "TIN_CERTIFICATE",
        fileName: "etin_certificate.pdf",
        fileSize: 1024 * 320,
        mimeType: "application/pdf",
        uploadedAt: "2026-10-15T09:30:00Z",
      },
    ],
    verificationNotes: "Physical premises inspection scheduled by Regional Field Officer.",
  },
  {
    id: "reg-seed-02",
    trackingNumber: "REG-2026-441209",
    role: UserRole.SALES_REP,
    status: RegistrationStatus.APPROVED,
    createdAt: "2026-10-10T11:00:00Z",
    updatedAt: "2026-10-12T16:00:00Z",
    isPhoneVerified: true,
    isEmailVerified: true,
    employeeId: "EMP-SQ-9941",
    ownerName: "Tanvir Ahmed Chowdhury",
    phone: "01819992211",
    email: "tanvir.mpo@squarepharma.com.bd",
    nidNumber: "1994269988112",
    affiliatedCompany: "Square Pharmaceuticals PLC",
    designatedTerritory: "Gulshan - Banani Medical Corridor",
    documents: [],
    verificationNotes: "Approved by Square Pharma Regional HR & Commercial Lead.",
  },
  {
    id: "reg-seed-03",
    trackingNumber: "REG-2026-110482",
    role: UserRole.RETAIL_PHARMACY,
    status: RegistrationStatus.REJECTED,
    createdAt: "2026-10-08T08:00:00Z",
    updatedAt: "2026-10-09T10:15:00Z",
    isPhoneVerified: true,
    isEmailVerified: false,
    shopName: "QuickCare Chemist Corner",
    ownerName: "Abul Kashem",
    phone: "01911447788",
    nidNumber: "1975269112233",
    tradeLicenseNo: "TRAD/DNCC/11029/2021",
    tinNumber: "123456789012",
    address: "Mirpur 1, Dhaka",
    latitude: 23.8067,
    longitude: 90.3541,
    documents: [],
    rejectionReason: "Trade License expired in June 2024. Please re-apply with a renewed 2026 Trade License.",
  },
];

// Helper to sanitize sensitive data for client exposure
function maskSensitive(val?: string, visibleTail = 4): string {
  if (!val) return "";
  if (val.length <= visibleTail) return val;
  return "*".repeat(val.length - visibleTail) + val.slice(-visibleTail);
}

// ----------------------------------------------------------------------------
// GET: Query Registration Status by Tracking Number or Phone
// ----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get("tracking")?.trim().toUpperCase();
  const phone = searchParams.get("phone")?.trim();

  if (!trackingNumber && !phone) {
    return NextResponse.json(
      { error: "Provide tracking number or registered phone to check status." },
      { status: 400 }
    );
  }

  const app = applications.find(
    (a) =>
      (trackingNumber && a.trackingNumber.toUpperCase() === trackingNumber) ||
      (phone && a.phone.replace(/[\s-]/g, "").endsWith(phone.replace(/[\s-]/g, "").slice(-10)))
  );

  if (!app) {
    return NextResponse.json(
      {
        found: false,
        message: "No registration record found matching the provided criteria. Please check your tracking number or register.",
      },
      { status: 404 }
    );
  }

  // Return sanitized application status info
  return NextResponse.json({
    found: true,
    application: {
      id: app.id,
      trackingNumber: app.trackingNumber,
      role: app.role,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      shopName: app.shopName,
      companyName: app.companyName,
      distributorName: app.distributorName,
      ownerName: app.ownerName,
      employeeId: app.employeeId,
      maskedPhone: maskSensitive(app.phone, 3),
      maskedNid: maskSensitive(app.nidNumber, 4),
      maskedTin: maskSensitive(app.tinNumber, 4),
      address: app.address,
      latitude: app.latitude,
      longitude: app.longitude,
      verificationNotes: app.verificationNotes,
      rejectionReason: app.rejectionReason,
      documentsCount: app.documents?.length || 0,
    },
  });
}

// ----------------------------------------------------------------------------
// POST: Submit New Role-Specific Registration
// ----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: "User role must be specified." },
        { status: 400 }
      );
    }

    // Role-specific schema validation
    let validationResult;
    switch (role) {
      case UserRole.PHARMACY_OWNER:
        validationResult = PharmacyOwnerRegistrationSchema.safeParse(body);
        break;
      case UserRole.RETAIL_PHARMACY:
        validationResult = RetailPharmacyRegistrationSchema.safeParse(body);
        break;
      case UserRole.PHARMA_COMPANY:
        validationResult = PharmaCompanyRegistrationSchema.safeParse(body);
        break;
      case UserRole.DISTRIBUTOR:
        validationResult = DistributorRegistrationSchema.safeParse(body);
        break;
      case UserRole.SALES_REP:
        validationResult = SalesRepRegistrationSchema.safeParse(body);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Invalid or unsupported registration role: ${role}` },
          { status: 400 }
        );
    }

    if (!validationResult.success) {
      const flattened = validationResult.error.flatten();
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for one or more required fields.",
          fieldErrors: flattened.fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data as any;

    // Check for duplicate accounts (prevent duplicate phone, email, trade license, or NID)
    const normalizedPhone = validatedData.phone?.replace(/[\s-]/g, "");
    const normalizedEmail = (validatedData.email || validatedData.officialEmail)?.toLowerCase();
    const normalizedTrade = validatedData.tradeLicenseNo?.trim().toLowerCase();
    const normalizedNid = validatedData.nidNumber?.trim();

    const existingApp = applications.find((a) => {
      if (normalizedPhone && a.phone.replace(/[\s-]/g, "") === normalizedPhone) return true;
      if (normalizedEmail && a.email && a.email.toLowerCase() === normalizedEmail) return true;
      if (normalizedTrade && a.tradeLicenseNo && a.tradeLicenseNo.toLowerCase() === normalizedTrade) return true;
      if (normalizedNid && a.nidNumber && a.nidNumber === normalizedNid) return true;
      return false;
    });

    if (existingApp) {
      return NextResponse.json(
        {
          success: false,
          error: `An application with tracking #${existingApp.trackingNumber} already exists with this phone, NID, or Trade License.`,
          existingTrackingNumber: existingApp.trackingNumber,
          currentStatus: existingApp.status,
        },
        { status: 409 }
      );
    }

    // Process and validate documents
    const rawDocs = body.documents || [];
    const validatedDocs: any[] = [];
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    for (const doc of rawDocs) {
      if (doc.fileSize && doc.fileSize > maxSizeBytes) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${doc.fileName || "document"} exceeds the 5MB size limit.`,
          },
          { status: 400 }
        );
      }
      if (doc.mimeType && !allowedMimeTypes.includes(doc.mimeType)) {
        return NextResponse.json(
          {
            success: false,
            error: `File type ${doc.mimeType} is not supported. Use JPG, PNG, WebP, or PDF.`,
          },
          { status: 400 }
        );
      }
      validatedDocs.push({
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: doc.type || "TIN_CERTIFICATE",
        fileName: doc.fileName || "document.pdf",
        fileSize: doc.fileSize || 1024 * 100,
        mimeType: doc.mimeType || "application/pdf",
        dataUrl: doc.dataUrl, // Preserved in secure storage
        uploadedAt: new Date().toISOString(),
      });
    }

    // Generate unique 6-digit tracking number
    const trackingNumber = `REG-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newApplication: IRegistrationApplication = {
      id: `app-${Date.now()}`,
      trackingNumber,
      role: validatedData.role,
      status: RegistrationStatus.PENDING_VERIFICATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPhoneVerified: !!validatedData.isPhoneVerified,
      isEmailVerified: !!validatedData.isEmailVerified,
      shopName: validatedData.shopName,
      companyName: validatedData.companyName,
      distributorName: validatedData.distributorName,
      ownerName: validatedData.ownerName || validatedData.authorizedRepresentativeName,
      authorizedPersonName: validatedData.ownerName,
      phone: validatedData.phone || validatedData.officialPhone || "",
      email: validatedData.email || validatedData.officialEmail,
      nidNumber: validatedData.nidNumber,
      tradeLicenseNo: validatedData.tradeLicenseNo,
      tinNumber: validatedData.tinNumber,
      address: validatedData.address,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      employeeId: validatedData.employeeId,
      affiliatedCompany: validatedData.affiliatedCompany,
      designatedTerritory: validatedData.designatedTerritory,
      serviceArea: validatedData.serviceArea,
      authorizedPharmaCompanies: validatedData.authorizedPharmaCompanies,
      documents: validatedDocs,
      verificationNotes: "Registration received successfully. Awaiting DGDA regulatory credential validation & territory audit.",
    };

    // Prepend to application store
    applications.unshift(newApplication);

    return NextResponse.json(
      {
        success: true,
        message: "Registration application received and placed in verification queue.",
        trackingNumber,
        status: RegistrationStatus.PENDING_VERIFICATION,
        submittedAt: newApplication.createdAt,
        role: newApplication.role,
        entityName:
          newApplication.shopName ||
          newApplication.companyName ||
          newApplication.distributorName ||
          newApplication.ownerName ||
          "Applicant",
        estimatedReviewDays: 2,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected server error occurred during registration.",
      },
      { status: 500 }
    );
  }
}
