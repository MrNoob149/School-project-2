```erDiagram
	project ||--o{ UserProjects : references
	User ||--o{ UserProjects : references
	Video ||--o{ Video/Image : references
	Image ||--o{ Video/Image : references
	Video/Image ||--o{ project : references
	project ||--|| ProjectTags : references
	ProjectTags }o--|| Category : references
	user_roles ||--|| User : references
	user_roles ||--|| roles : references
	permission ||--o{ roles_permission : references
	roles_permission }o--|| roles : references
	Image ||--o{ Video/Image : references

	project {
		INTEGER id
		INTEGER Video/Image_ID
		INTEGER Tags_ID
		VARCHAR(255) Title
		LONGTEXT(65535) Description
	}

	User {
		INTEGER id
		VARCHAR(255) First_Name
		VARCHAR(255) Last_Name
		VARCHAR(255) Email
		VARCHAR(255) Password
		INTEGER user_id
	}

	UserProjects {
		INTEGER Users_ID
		INTEGER Projects_ID
	}

	Image {
		INTEGER id
		TEXT(65535) URL
		 code
		 resolution
	}

	Video {
		INTEGER id
		TEXT(65535) URL
		INTEGER video.length
		SMALLINT resolution
	}

	Video/Image {
		INTEGER id
		INTEGER ImageID
		INTEGER VideoID
	}

	ProjectTags {
		INTEGER project_id
		INTEGER tags_id
	}

	user_roles {
		INTEGER user_id
		INTEGER roles_id
	}

	Category {
		INTEGER id
		VARCHAR(255) title
		TEXT(65535) description
	}

	roles {
		INTEGER id
		VARCHAR(255) name
		SMALLINT active
		VARCHAR(255) slug
		DATETIME CreatedAt
		DATETIME UpdatedAt
		TEXT(65535) Content
	}

	permission {
		INTEGER id
		VARCHAR(255) name
		VARCHAR(255) slug
		TEXT(65535) description
		TINYINT Active
		DATETIME CreatedAt
		DATETIME DeactivateAt
		TEXT(65535) Content
	}

	roles_permission {
		INTEGER permission_id
		INTEGER roles_id
		DATETIME CreatedAt
		DATETIME UpdatedAt
	}
```
