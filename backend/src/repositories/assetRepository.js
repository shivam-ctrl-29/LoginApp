const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAllAssets = async ({ search, status, page, limit }) => {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { assetName: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { assetType: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        allocations: {
          where: { status: 'allocated' },
          include: { employee: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.asset.count({ where }),
  ]);

  return { assets, total };
};

const findAssetById = async (id) => {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      allocations: {
        include: { employee: { select: { id: true, name: true, email: true } } },
      },
      history: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

const createAsset = async (data) => {
  return prisma.asset.create({ data });
};

const updateAsset = async (id, data) => {
  return prisma.asset.update({ where: { id }, data });
};

const deleteAsset = async (id) => {
  return prisma.asset.delete({ where: { id } });
};

const allocateAsset = async ({ assetId, employeeId, allocatedById }) => {
  return prisma.$transaction(async (tx) => {
    const allocation = await tx.assetAllocation.create({
      data: { assetId, employeeId, allocatedById, status: 'allocated' },
    });

    await tx.asset.update({
      where: { id: assetId },
      data: { status: 'allocated' },
    });

    await tx.assetHistory.create({
      data: {
        assetId,
        action: 'ALLOCATED',
        remarks: `Allocated to employee ID ${employeeId}`,
        createdById: allocatedById,
      },
    });

    return allocation;
  });
};

const returnAsset = async ({ assetId, employeeId, returnedById }) => {
  return prisma.$transaction(async (tx) => {
    await tx.assetAllocation.updateMany({
      where: { assetId, employeeId, status: 'allocated' },
      data: { status: 'returned', returnDate: new Date() },
    });

    await tx.asset.update({
      where: { id: assetId },
      data: { status: 'available' },
    });

    await tx.assetHistory.create({
      data: {
        assetId,
        action: 'RETURNED',
        remarks: `Returned by employee ID ${employeeId}`,
        createdById: returnedById,
      },
    });
  });
};

module.exports = { findAllAssets, findAssetById, createAsset, updateAsset, deleteAsset, allocateAsset, returnAsset };
