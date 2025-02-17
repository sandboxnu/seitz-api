import { connectDB, closeDB, clearDB } from "../config/database";
import { seedDatabase, seedCustomizedBatteries } from "../seed";
import * as adminService from "../../src/services/admin.service";
import HttpError from "../../src/types/errors";

describe("Admin Service", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDB();
    await seedDatabase();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe("updateAdminVisibility", () => {
    it('should update visibility to true when setting to "on"', async () => {
      const batteryId = seedCustomizedBatteries[0]._id.toString();
      const [status, battery] = await adminService.updateAdminVisibility(
        batteryId,
        "on"
      );

      expect(status).toBe(200);
      expect(battery?.isVisibleToNonAdmins).toBe(true);
    });

    it('should update visibility to false when setting to "off"', async () => {
      const batteryId = seedCustomizedBatteries[0]._id.toString();
      const [status, battery] = await adminService.updateAdminVisibility(
        batteryId,
        "off"
      );

      expect(status).toBe(200);
      expect(battery?.isVisibleToNonAdmins).toBe(false);
    });

    it("should throw 400 error for invalid visibility value", async () => {
      const batteryId = seedCustomizedBatteries[0]._id.toString();

      await expect(
        adminService.updateAdminVisibility(batteryId, "invalid")
      ).rejects.toThrow(
        new HttpError(400, "Invalid visibility must be 'on' or 'off'")
      );
    });

    it("should throw 404 error for non-existent battery", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await expect(
        adminService.updateAdminVisibility(nonExistentId, "on")
      ).rejects.toThrow(
        new HttpError(404, `Battery not found ${nonExistentId}`)
      );
    });
  });
});
