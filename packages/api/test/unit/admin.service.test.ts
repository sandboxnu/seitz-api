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
    const batteryId = seedCustomizedBatteries[0]._id.toString();

    it('should update visibility to true when setting to "on"', async () => {
      const [status, battery] = await adminService.updateAdminVisibility(
        batteryId,
        "on"
      );

      expect(status).toBe(200);
      expect(battery?.isVisibleToNonAdmins).toBe(true);
    });

    it('should update visibility to false when setting to "off"', async () => {
      const [status, battery] = await adminService.updateAdminVisibility(
        batteryId,
        "off"
      );

      expect(status).toBe(200);
      expect(battery?.isVisibleToNonAdmins).toBe(false);
    });

    it("should default to false for invalid visibility value", async () => {
      const [status, battery] = await adminService.updateAdminVisibility(
        batteryId,
        "invalid"
      );

      expect(status).toBe(200);
      expect(battery?.isVisibleToNonAdmins).toBe(false);
    });

    describe("edge cases should default to false", () => {
      const testCases = [
        { desc: "undefined", value: undefined },
        { desc: "null", value: null },
        { desc: "empty string", value: "" },
        { desc: "number", value: 123 },
        { desc: "object", value: {} },
      ];

      testCases.forEach(({ desc, value }) => {
        it(`should handle ${desc} input`, async () => {
          const [status, battery] = await adminService.updateAdminVisibility(
            batteryId,
            value as unknown as string // have to do this to avoid type error :/
          );

          expect(status).toBe(200);
          expect(battery?.isVisibleToNonAdmins).toBe(false);
        });
      });
    });

    it("should throw 404 error for non-existent battery", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await expect(
        adminService.updateAdminVisibility(nonExistentId, "on")
      ).rejects.toThrow(
        new HttpError(404, `Battery not found with ID: ${nonExistentId}`)
      );
    });
  });
});
