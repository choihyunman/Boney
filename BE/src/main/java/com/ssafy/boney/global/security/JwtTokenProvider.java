package com.ssafy.boney.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private byte[] secretBytes;

    @PostConstruct
    protected void init() {
        if (!Base64.isBase64(secretKey)) {
            log.warn("Secret Key is not in Base64 format. Encoding it...");
            this.secretBytes = Base64.encodeBase64(secretKey.getBytes(StandardCharsets.UTF_8));
        } else {
            this.secretBytes = Base64.decodeBase64(secretKey);
        }
    }

    public String createToken(Map<String, Object> userClaims) {
        Date now = new Date();
        long validityInMilliseconds = 360000000;

        Map<String, Object> claims = new HashMap<>(userClaims);

        if (claims.containsKey("created_at") && claims.get("created_at") instanceof LocalDateTime) {
            LocalDateTime createdAt = (LocalDateTime) claims.get("created_at");
            claims.put("created_at", createdAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + validityInMilliseconds))
                .signWith(Keys.hmacShaKeyFor(secretBytes), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretBytes))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        return parseToken(token) != null;
    }


}
