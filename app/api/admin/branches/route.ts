import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";
import Branches, { zodBranchSchema, zodBranchUpdateSchema } from "@/models/Branches";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const isActive = searchParams.get('isActive');
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query: any = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { branchNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        // Execute query with pagination
        const [branches, total] = await Promise.all([
            Branches.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Branches.countDocuments(query)
        ]);
        
        return NextResponse.json({
            branches,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const body = await req.formData();
        
        // Validate required fields
        const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'branchNumber', 'location', 'city', 'state', 'postalCode'];
        for (const field of requiredFields) {
            if (!body.get(field)) {
                await session.abortTransaction();
                return NextResponse.json({ error: `${field} is required` }, { status: 400 });
            }
        }
        
        // Check if branch number already exists
        const existingBranch = await Branches.findOne({ branchNumber: body.get("branchNumber") }).session(session);
        if (existingBranch) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Branch number already exists" }, { status: 400 });
        }
        
        // Check if logo is provided
        if (!body.get("logo")) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Logo is required" }, { status: 400 });
        }
        
        // Create branch data
        const branchData = {
            name: body.get("name"),
            address: body.get("address"),
            phoneNumber: body.get("phoneNumber"),
            email: body.get("email"),
            branchNumber: body.get("branchNumber"),
            location: body.get("location"),
            city: body.get("city"),
            state: body.get("state"),
            country: body.get("country") || "India",
            postalCode: body.get("postalCode"),
            manager: body.get("manager") || "",
            openingHours: body.get("openingHours") || "",
            description: body.get("description") || "",
            website: body.get("website") || "",
            whatsapp: body.get("whatsapp") || "",
            isActive: body.get("isActive") === "true"
        };
        
        // Handle coordinates if provided
        const latitude = body.get("latitude");
        const longitude = body.get("longitude");
        if (latitude && longitude) {
            branchData.coordinates = {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
            };
        }
        
        // Create branch
        const branch = await Branches.create([branchData], { session }).then(res => res[0]);
        
        if (!branch) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
        }
        
        // Upload logo
        const logo = body.get("logo") as File;
        const uploadedFiles = await uploaderFiles("branches", logo, branch._id);
        
        branch.logo = uploadedFiles[0].url;
        await branch.save({ session });
        
        await session.commitTransaction();
        
        return NextResponse.json({ 
            message: "Branch created successfully", 
            branch 
        }, { status: 201 });
        
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating branch:", error);
        return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function PUT(req: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const body = await req.formData();
        const branchId = body.get("id");
        
        if (!branchId) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
        }
        
        // Check if branch exists
        const existingBranch = await Branches.findById(branchId).session(session);
        if (!existingBranch) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Branch not found" }, { status: 404 });
        }
        
        // Check if new branch number conflicts with existing ones
        const newBranchNumber = body.get("branchNumber");
        if (newBranchNumber && newBranchNumber !== existingBranch.branchNumber) {
            const conflictBranch = await Branches.findOne({ 
                branchNumber: newBranchNumber, 
                _id: { $ne: branchId } 
            }).session(session);
            
            if (conflictBranch) {
                await session.abortTransaction();
                return NextResponse.json({ error: "Branch number already exists" }, { status: 400 });
            }
        }
        
        // Update branch data
        const updateData: any = {
            name: body.get("name") || existingBranch.name,
            address: body.get("address") || existingBranch.address,
            phoneNumber: body.get("phoneNumber") || existingBranch.phoneNumber,
            email: body.get("email") || existingBranch.email,
            branchNumber: body.get("branchNumber") || existingBranch.branchNumber,
            location: body.get("location") || existingBranch.location,
            city: body.get("city") || existingBranch.city,
            state: body.get("state") || existingBranch.state,
            country: body.get("country") || existingBranch.country,
            postalCode: body.get("postalCode") || existingBranch.postalCode,
            manager: body.get("manager") || existingBranch.manager,
            openingHours: body.get("openingHours") || existingBranch.openingHours,
            description: body.get("description") || existingBranch.description,
            website: body.get("website") || existingBranch.website,
            whatsapp: body.get("whatsapp") || existingBranch.whatsapp,
            isActive: body.get("isActive") !== null ? body.get("isActive") === "true" : existingBranch.isActive
        };
        
        // Handle coordinates
        const latitude = body.get("latitude");
        const longitude = body.get("longitude");
        if (latitude && longitude) {
            updateData.coordinates = {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
            };
        }
        
        // Update branch
        const updatedBranch = await Branches.findByIdAndUpdate(
            branchId,
            updateData,
            { new: true, session }
        );
        
        // Handle logo update if provided
        if (body.get("logo")) {
            const logo = body.get("logo") as File;
            const uploadedFiles = await uploaderFiles("branches", logo, branchId);
            updatedBranch.logo = uploadedFiles[0].url;
            await updatedBranch.save({ session });
        }
        
        await session.commitTransaction();
        
        return NextResponse.json({ 
            message: "Branch updated successfully", 
            branch: updatedBranch 
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error("Error updating branch:", error);
        return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function DELETE(req: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const body = await req.formData();
        const branchId = body.get("id");
        
        if (!branchId) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
        }
        
        const branch = await Branches.findByIdAndDelete(branchId, { session });
        
        if (!branch) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Branch not found" }, { status: 404 });
        }
        
        await session.commitTransaction();
        
        return NextResponse.json({ 
            message: "Branch deleted successfully", 
            branch 
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error("Error deleting branch:", error);
        return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
    } finally {
        session.endSession();
    }
}