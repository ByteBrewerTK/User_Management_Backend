import Role from "../models/role.model.js";

// Create a new role
export const createRole = async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Role name is required" });
		}

		const role = await Role.create({ name });

		return res
			.status(201)
			.json({ message: "Role created successfully", role });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error creating role", error: error.message });
	}
};

// Get all roles
export const getAllRoles = async (req, res) => {
	try {
		const roles = await Role.findAll();
		return res.status(200).json(roles);
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error fetching roles", error: error.message });
	}
};

// Get a role by ID
export const getRoleById = async (req, res) => {
	try {
		const { id } = req.params;
		const role = await Role.findByPk(id);

		if (!role) {
			return res.status(404).json({ message: "Role not found" });
		}

		return res.status(200).json(role);
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error fetching role", error: error.message });
	}
};

// Update a role
export const updateRole = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const role = await Role.findByPk(id);
		if (!role) {
			return res.status(404).json({ message: "Role not found" });
		}

		role.name = name || role.name;
		await role.save();

		return res
			.status(200)
			.json({ message: "Role updated successfully", role });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error updating role", error: error.message });
	}
};

// Delete a role
export const deleteRole = async (req, res) => {
	try {
		const { id } = req.params;

		const role = await Role.findByPk(id);
		if (!role) {
			return res.status(404).json({ message: "Role not found" });
		}

		await role.destroy();
		return res.status(200).json({ message: "Role deleted successfully" });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error deleting role", error: error.message });
	}
};
