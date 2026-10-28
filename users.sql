-- The users of the API, for Task 2. Run it once, on the university
-- database, after university_database.sql.
--
-- The passwords are stored the way src/auth/crypto.ts stores them for now:
-- 'PLAIN:' followed by the password. That is a placeholder, not security,
-- and it is replaced after the security lectures.
--
--     username   password      role
--     admin      admin-pw      admin
--     einstein   einstein-pw   instructor
--     katz       katz-pw       instructor

drop table if exists app_user;

create table app_user
	(id			varchar(5),	-- for an instructor, the same as their instructor id
	 username		varchar(20) not null unique,
	 hash			varchar(100) not null,
	 role			varchar(10) not null
		check (role in ('admin', 'instructor')),
	 primary key (id)
	);

insert into app_user values ('00000', 'admin', 'PLAIN:admin-pw', 'admin');
insert into app_user values ('22222', 'einstein', 'PLAIN:einstein-pw', 'instructor');
insert into app_user values ('45565', 'katz', 'PLAIN:katz-pw', 'instructor');
