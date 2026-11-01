/* 장비 아이콘 16종: 무기 10종과 장비 6종. 시안은 prototype/README.md의 아이콘 캔버스에 있다.
   그림 규칙은 docs/art-direction.md와 같다: 잉크선 #15131F, 왼쪽 위 광원, 경계가 또렷한 셀 음영. 좌표는 200칸 상자다.
   SVG를 data URL 이미지로 읽어 art-item.js가 캔버스에 찍는다. 여기 없는 장비는 art-item.js의 GEAR 그림을 쓴다. */
(function (A) {
  'use strict';
  const SVG = {
    /* 쌍열 작살포: 쌍둥이 어뢰 */
    twinHarpoon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="fa" d="M54 66L34 50C30 47 25 50 27 55L36 72ZM54 94L34 110C30 113 25 110 27 105L36 88Z"/>
<path id="ta" d="M52 61H140C162 61 174 71 174 80C174 89 162 99 140 99H52C44 99 40 91 40 80C40 69 44 61 52 61Z"/>
<path id="fb" d="M42 110L22 94C18 91 13 94 15 99L24 116ZM42 138L22 154C18 157 13 154 15 149L24 132Z"/>
<path id="tb" d="M40 105H128C150 105 162 115 162 124C162 133 150 143 128 143H40C32 143 28 135 28 124C28 113 32 105 40 105Z"/>
<clipPath id="ca"><use href="#ta"/></clipPath>
<clipPath id="cb"><use href="#tb"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-35) scale(0.86) translate(-94 -102)" stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="15">
<use href="#fa"/><ellipse cx="30" cy="80" rx="6" ry="13"/><use href="#ta"/>
<use href="#fb"/><ellipse cx="18" cy="124" rx="6" ry="13"/><use href="#tb"/>
</g>
<use href="#fa" fill="#5A6478" stroke="#15131F" stroke-width="4.5"/>
<ellipse cx="30" cy="80" rx="6" ry="13" fill="#C9D3E0" stroke="#15131F" stroke-width="4.5"/>
<use href="#ta" fill="#D9601A"/>
<g clip-path="url(#ca)">
<use href="#ta" fill="#FF8A2A" transform="translate(0 -9)"/>
<rect x="114" y="55" width="14" height="35" fill="#FFF1DC"/>
<rect x="114" y="90" width="14" height="12" fill="#E8C49A"/>
<rect x="56" y="66" width="52" height="6" rx="3" fill="#fff" opacity="0.75"/>
<ellipse cx="155" cy="70" rx="7" ry="3.5" fill="#fff" opacity="0.85"/>
</g>
<path d="M114 61V99M128 61V99" fill="none" stroke="#15131F" stroke-width="3.5"/>
<use href="#ta" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#fb" fill="#5A6478" stroke="#15131F" stroke-width="4.5"/>
<ellipse cx="18" cy="124" rx="6" ry="13" fill="#C9D3E0" stroke="#15131F" stroke-width="4.5"/>
<use href="#tb" fill="#D9601A"/>
<g clip-path="url(#cb)">
<use href="#tb" fill="#FF8A2A" transform="translate(0 -9)"/>
<rect x="102" y="99" width="14" height="35" fill="#FFF1DC"/>
<rect x="102" y="134" width="14" height="12" fill="#E8C49A"/>
<rect x="44" y="110" width="52" height="6" rx="3" fill="#fff" opacity="0.75"/>
<ellipse cx="143" cy="114" rx="7" ry="3.5" fill="#fff" opacity="0.85"/>
</g>
<path d="M102 105V143M116 105V143" fill="none" stroke="#15131F" stroke-width="3.5"/>
<use href="#tb" fill="none" stroke="#15131F" stroke-width="4.5"/>
</g>
</svg>`,
    /* 전방 산탄포: 산호 가시 발사기 */
    scatter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="sa" d="M92 86L98 40L112 20L116 46L108 92Z"/>
<path id="sb" d="M106 96L142 64L178 46L162 80L116 110Z"/>
<path id="sc" d="M112 106L150 98L188 104L156 118L112 122Z"/>
<path id="gp" d="M70 144L62 176C61 182 68 185 73 182L90 148Z"/>
<path id="cb" d="M40 120C36 98 52 82 72 84C86 74 106 80 110 96C124 102 126 122 114 132C112 150 92 158 78 150C62 160 42 150 44 136C36 132 36 124 40 120Z"/>
<clipPath id="cc"><use href="#cb"/></clipPath>
<clipPath id="cg"><use href="#gp"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="13">
<use href="#gp"/><use href="#sa"/><use href="#sb"/><use href="#sc"/><use href="#cb"/>
<circle cx="50" cy="94" r="9"/><circle cx="100" cy="80" r="8"/><circle cx="120" cy="128" r="8"/>
</g>
<use href="#gp" fill="#D9741F"/>
<g clip-path="url(#cg)"><use href="#gp" fill="#FF9F45" transform="translate(-5 -7)"/></g>
<use href="#gp" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#sa" fill="#FFE3F0"/>
<path d="M100 89L112 20L116 46L108 92Z" fill="#F7A9CC"/>
<path d="M100 89L112 20" fill="none" stroke="#15131F" stroke-width="2.5"/>
<path d="M99 72L105 42" fill="none" stroke="#fff" stroke-width="3"/>
<use href="#sa" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#sb" fill="#FFE3F0"/>
<path d="M111 103L178 46L162 80L116 110Z" fill="#F7A9CC"/>
<path d="M111 103L178 46" fill="none" stroke="#15131F" stroke-width="2.5"/>
<path d="M126 84L152 62" fill="none" stroke="#fff" stroke-width="3"/>
<use href="#sb" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#sc" fill="#FFE3F0"/>
<path d="M112 114L188 104L156 118L112 122Z" fill="#F7A9CC"/>
<path d="M112 114L188 104" fill="none" stroke="#15131F" stroke-width="2.5"/>
<path d="M128 107L160 102" fill="none" stroke="#fff" stroke-width="3"/>
<use href="#sc" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#cb" fill="#D94F7E"/>
<g clip-path="url(#cc)">
<use href="#cb" fill="#FF7FA8" transform="translate(-5 -7)"/>
<g fill="#C2416C"><circle cx="62" cy="112" r="2.6"/><circle cx="76" cy="103" r="2.4"/><circle cx="90" cy="117" r="2.6"/><circle cx="66" cy="129" r="2.4"/><circle cx="98" cy="131" r="2.4"/><circle cx="81" cy="139" r="2.6"/><circle cx="104" cy="106" r="2.2"/></g>
<path d="M50 114C50 102 57 94 67 91" fill="none" stroke="#fff" stroke-width="5" opacity="0.8"/>
</g>
<use href="#cb" fill="none" stroke="#15131F" stroke-width="4"/>
<g fill="#FF9F45" stroke="#15131F" stroke-width="4">
<circle cx="50" cy="94" r="9"/><circle cx="100" cy="80" r="8"/><circle cx="120" cy="128" r="8"/>
</g>
<g fill="#FFE3C4"><circle cx="47" cy="90.5" r="2.6"/><circle cx="97.5" cy="77" r="2.4"/><circle cx="117.5" cy="125" r="2.4"/></g>
<path d="M144 32L156 18L162 22L150 36Z" fill="#FFE3F0" stroke="#15131F" stroke-width="3.5"/>
<path d="M176 82L192 72L195 77L179 87Z" fill="#FFE3F0" stroke="#15131F" stroke-width="3.5"/>
<path d="M134 44L140 38M166 93L172 89" fill="none" stroke="#15131F" stroke-width="3.5"/>
<path d="M66 56Q66 64 74 64Q66 64 66 72Q66 64 58 64Q66 64 66 56Z" fill="#fff" stroke="#15131F" stroke-width="2.5"/>
<path d="M174 127Q174 134 181 134Q174 134 174 141Q174 134 167 134Q174 134 174 127Z" fill="#fff" stroke="#15131F" stroke-width="2.5"/>
</g>
</svg>`,
    /* 전류 코일건: 전기뱀장어 건 */
    coilGun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gl"><stop offset="0" stop-color="#7FF3FF" stop-opacity="0.75"/><stop offset="1" stop-color="#7FF3FF" stop-opacity="0"/></radialGradient>
<path id="tf" d="M36 97L10 80C5 92 5 112 10 122L36 107Z"/>
<path id="df" d="M64 90C76 76 96 72 114 80L104 94Z"/>
<path id="gr" d="M74 108L66 140C65 146 71 149 76 146L92 112Z"/>
<path id="eb" d="M30 96C48 84 66 86 84 92C102 98 118 86 140 84C160 82 178 88 186 98L170 102L186 108C178 118 162 122 142 120C120 118 104 112 86 110C68 108 50 112 30 108Z"/>
<path id="bt" d="M184 104L200 95L196 103L210 100L193 114L197 106Z"/>
<clipPath id="ce"><use href="#eb"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-35) scale(0.82) translate(-98 -104)" stroke-linejoin="round" stroke-linecap="round">
<circle cx="180" cy="104" r="46" fill="url(#gl)"/>
<g fill="#15131F" stroke="#15131F" stroke-width="16"><use href="#tf"/><use href="#df"/><use href="#gr"/><use href="#eb"/><use href="#bt"/></g>
<use href="#tf" fill="#1B4FC4" stroke="#15131F" stroke-width="4.5"/>
<path d="M30 100L15 91M30 104L15 113" fill="none" stroke="#7FF3FF" stroke-width="3"/>
<use href="#df" fill="#1B4FC4" stroke="#15131F" stroke-width="4.5"/>
<path d="M78 86L92 80" fill="none" stroke="#7FF3FF" stroke-width="3"/>
<use href="#gr" fill="#3B4356" stroke="#15131F" stroke-width="4.5"/>
<use href="#eb" fill="#1B4FC4"/>
<g clip-path="url(#ce)">
<use href="#eb" fill="#2F7BFF" transform="translate(0 -10)"/>
<polyline points="40,103 54,97 66,105 80,98 96,106 112,98 128,105 144,98 156,104" fill="none" stroke="#2FD7FF" stroke-width="9" opacity="0.5"/>
<polyline points="40,103 54,97 66,105 80,98 96,106 112,98 128,105 144,98 156,104" fill="none" stroke="#CFFFFF" stroke-width="3.5"/>
<path d="M48 93C62 87 74 88 86 93" fill="none" stroke="#fff" stroke-width="4" opacity="0.8"/>
<ellipse cx="146" cy="89" rx="9" ry="3" fill="#fff" opacity="0.85"/>
</g>
<use href="#eb" fill="none" stroke="#15131F" stroke-width="4.5"/>
<circle cx="157" cy="95" r="6.5" fill="#fff" stroke="#15131F" stroke-width="3"/>
<circle cx="158.5" cy="96" r="3.2" fill="#15131F"/>
<circle cx="156.4" cy="93.6" r="1.3" fill="#fff"/>
<use href="#bt" fill="#CFFFFF" stroke="#15131F" stroke-width="3.5"/>
<g fill="none">
<polyline points="172,80 178,72 182,78 188,70" stroke="#15131F" stroke-width="8"/>
<polyline points="176,126 182,132 188,126 194,133" stroke="#15131F" stroke-width="8"/>
<polyline points="172,80 178,72 182,78 188,70" stroke="#7FF3FF" stroke-width="3.5"/>
<polyline points="176,126 182,132 188,126 194,133" stroke="#7FF3FF" stroke-width="3.5"/>
</g>
</g>
</svg>`,
    /* 유도 어뢰관: 거품 유도 어뢰 */
    torpedo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="fn" d="M-20 -34L-52 -40C-58 -41 -61 -35 -58 -31L-42 -12ZM-20 34L-52 40C-58 41 -61 35 -58 31L-42 12Z"/>
<ellipse id="bd" cx="0" cy="0" rx="46" ry="40"/>
<path id="ns" d="M30 -27C44 -21 51 -9 51 0C51 9 44 21 30 27C37 10 37 -10 30 -27Z"/>
<clipPath id="cb"><use href="#bd"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#E8F8FF" stroke="#15131F" stroke-width="3.5">
<circle cx="38" cy="156" r="7"/><circle cx="25" cy="171" r="5.5"/><circle cx="19" cy="186" r="4.2"/>
</g>
<g fill="#fff"><circle cx="35.5" cy="153.5" r="2"/><circle cx="23.5" cy="169" r="1.6"/></g>
<g fill="none" stroke="#15131F" stroke-width="9">
<circle cx="166" cy="48" r="17"/><path d="M166 22V32M166 64V74M140 48H150M182 48H192"/>
</g>
<g fill="none" stroke="#FF5A5F" stroke-width="4.5">
<circle cx="166" cy="48" r="17"/><path d="M166 22V32M166 64V74M140 48H150M182 48H192"/>
</g>
<circle cx="166" cy="48" r="4" fill="#FF5A5F" stroke="#15131F" stroke-width="2.5"/>
<g transform="translate(92 112) rotate(-38)">
<g fill="#15131F" stroke="#15131F" stroke-width="13"><use href="#fn"/><ellipse cx="-50" cy="0" rx="7" ry="14"/><use href="#bd"/><use href="#ns"/></g>
<use href="#fn" fill="#F4FBFF" stroke="#15131F" stroke-width="4"/>
<ellipse cx="-50" cy="0" rx="7" ry="14" fill="#C9D3E0" stroke="#15131F" stroke-width="4"/>
<use href="#bd" fill="#4FA9E0"/>
<g clip-path="url(#cb)">
<use href="#bd" fill="#8FDBFF" transform="translate(0 -8.6)"/>
<path d="M-16 -44C-6 -20 -6 20 -16 44H-3C7 20 7 -20 -3 -44Z" fill="#fff" opacity="0.9"/>
<path d="M-34 -14C-30 -28 -16 -36 -2 -36C-16 -30 -24 -22 -28 -10Z" fill="#fff"/>
<circle cx="-34" cy="-1" r="3.5" fill="#fff"/>
</g>
<use href="#bd" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#ns" fill="#F4FBFF" stroke="#15131F" stroke-width="4"/>
<circle cx="40" cy="0" r="7.5" fill="#1C2856" stroke="#15131F" stroke-width="3"/>
<circle cx="38" cy="-2.5" r="2.5" fill="#7FF3FF"/>
</g>
</g>
</svg>`,
    /* 폭뢰 박격포 */
    depthMortar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="bs" d="M30 176C30 146 52 132 86 132C120 132 142 146 142 176Z"/>
<rect id="tu" x="64" y="82" width="44" height="62" rx="10"/>
<rect id="rg" x="58" y="72" width="56" height="18" rx="7"/>
<rect id="dr" x="-20" y="-16" width="40" height="32" rx="9"/>
<clipPath id="cbs"><use href="#bs"/></clipPath>
<clipPath id="ctu"><use href="#tu"/></clipPath>
<clipPath id="crg"><use href="#rg"/></clipPath>
<clipPath id="cdr"><use href="#dr"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="13">
<g transform="rotate(28 86 138)"><use href="#tu"/><use href="#rg"/></g>
<use href="#bs"/>
<g transform="translate(164 42) rotate(18)"><use href="#dr"/><rect x="-4" y="-25" width="8" height="10" rx="2"/></g>
</g>
<g transform="rotate(28 86 138)">
<use href="#tu" fill="#1C2856"/>
<g clip-path="url(#ctu)">
<use href="#tu" fill="#2C3E7A" transform="translate(-7.5 -4)"/>
<rect x="60" y="110" width="52" height="9" fill="#FFD23F"/>
<rect x="70" y="90" width="5" height="16" rx="2.5" fill="#fff" opacity="0.5"/>
</g>
<path d="M64 110H108M64 119H108" fill="none" stroke="#15131F" stroke-width="3"/>
<use href="#tu" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#rg" fill="#E0A21E"/>
<g clip-path="url(#crg)"><use href="#rg" fill="#FFD23F" transform="translate(-7.5 -4)"/></g>
<use href="#rg" fill="none" stroke="#15131F" stroke-width="4"/>
<ellipse cx="86" cy="73" rx="22" ry="5" fill="#0B0F22" stroke="#15131F" stroke-width="3"/>
</g>
<use href="#bs" fill="#1C2856"/>
<g clip-path="url(#cbs)">
<use href="#bs" fill="#2C3E7A" transform="translate(-5 -7)"/>
<rect x="20" y="162" width="130" height="16" fill="#FFD23F"/>
<path d="M40 162L32 176H40L48 162ZM58 162L50 176H58L66 162ZM76 162L68 176H76L84 162ZM94 162L86 176H94L102 162ZM112 162L104 176H112L120 162ZM130 162L122 176H130L138 162Z" fill="#15131F" opacity="0.85"/>
<path d="M44 152C48 145 57 141 67 140" fill="none" stroke="#fff" stroke-width="5" opacity="0.6"/>
</g>
<path d="M30 162H142" fill="none" stroke="#15131F" stroke-width="3.5"/>
<use href="#bs" fill="none" stroke="#15131F" stroke-width="4"/>
<g fill="#C9D3E0" stroke="#15131F" stroke-width="2.5"><circle cx="52" cy="151" r="4.5"/><circle cx="120" cy="151" r="4.5"/></g>
<g fill="#EEF3FA" stroke="#15131F" stroke-width="3.5"><circle cx="104" cy="60" r="8"/><circle cx="119" cy="53" r="6"/></g>
<g fill="#15131F"><circle cx="126" cy="44" r="2.6"/><circle cx="130" cy="33" r="2.6"/><circle cx="137" cy="24" r="2.6"/></g>
<g transform="translate(164 42) rotate(18)">
<rect x="-4" y="-25" width="8" height="10" rx="2" fill="#C9D3E0" stroke="#15131F" stroke-width="3.5"/>
<use href="#dr" fill="#1C2856"/>
<g clip-path="url(#cdr)">
<use href="#dr" fill="#2C3E7A" transform="translate(-7 -5)"/>
<rect x="-20" y="-16" width="9" height="32" fill="#FFD23F"/>
<rect x="11" y="-16" width="9" height="32" fill="#FFD23F"/>
<rect x="-6" y="-11" width="4" height="18" rx="2" fill="#fff" opacity="0.55"/>
</g>
<path d="M-11 -16V16M11 -16V16" fill="none" stroke="#15131F" stroke-width="3"/>
<use href="#dr" fill="none" stroke="#15131F" stroke-width="4"/>
<path d="M0 -38Q0 -31 7 -31Q0 -31 0 -24Q0 -31 -7 -31Q0 -31 0 -38Z" fill="#FFD23F" stroke="#15131F" stroke-width="2.5"/>
</g>
</g>
</svg>`,
    /* 소나 파동포 */
    sonarCannon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gl"><stop offset="0" stop-color="#3FF0FF" stop-opacity="0.8"/><stop offset="1" stop-color="#3FF0FF" stop-opacity="0"/></radialGradient>
<path id="gp" d="M52 118L44 150C43 156 50 159 55 155L68 120Z"/>
<rect id="hs" x="30" y="78" width="46" height="44" rx="14"/>
<path id="ds" d="M100 36C64 52 56 148 100 164L114 156C82 140 82 60 114 44Z"/>
<clipPath id="chs"><use href="#hs"/></clipPath>
<clipPath id="cds"><use href="#ds"/></clipPath>
<clipPath id="cco"><circle cx="140" cy="100" r="14"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-30) scale(0.8) translate(-110 -102)" stroke-linejoin="round" stroke-linecap="round">
<circle cx="140" cy="100" r="48" fill="url(#gl)"/>
<g fill="none" stroke="#15131F" stroke-width="12">
<path d="M158.7 79.2A28 28 0 0 1 158.7 120.8"/><path d="M168.1 68.8A42 42 0 0 1 168.1 131.2"/><path d="M177.5 58.4A56 56 0 0 1 177.5 141.6"/>
</g>
<g fill="none" stroke-width="6">
<path d="M158.7 79.2A28 28 0 0 1 158.7 120.8" stroke="#3FF0FF"/><path d="M168.1 68.8A42 42 0 0 1 168.1 131.2" stroke="#3FF0FF"/><path d="M177.5 58.4A56 56 0 0 1 177.5 141.6" stroke="#A6FAFF"/>
</g>
<g fill="#15131F" stroke="#15131F" stroke-width="16">
<use href="#gp"/><use href="#hs"/><rect x="72" y="90" width="26" height="20"/><use href="#ds"/><ellipse cx="108" cy="100" rx="14" ry="56"/><rect x="108" y="95" width="26" height="10"/><circle cx="140" cy="100" r="14"/>
</g>
<use href="#gp" fill="#3B4356" stroke="#15131F" stroke-width="4.5"/>
<use href="#hs" fill="#1C2856"/>
<g clip-path="url(#chs)">
<use href="#hs" fill="#2C3E7A" transform="translate(-1 -10)"/>
<rect x="46" y="70" width="9" height="60" fill="#FFD23F"/>
</g>
<use href="#hs" fill="none" stroke="#15131F" stroke-width="4.5"/>
<rect x="72" y="90" width="26" height="20" fill="#C9D3E0"/>
<rect x="72" y="102" width="26" height="8" fill="#8C98AD"/>
<rect x="72" y="90" width="26" height="20" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#ds" fill="#8C98AD"/>
<g clip-path="url(#cds)"><use href="#ds" fill="#C9D3E0" transform="translate(-1 -10)"/></g>
<use href="#ds" fill="none" stroke="#15131F" stroke-width="4.5"/>
<ellipse cx="108" cy="100" rx="14" ry="56" fill="#E6EEF7" stroke="#15131F" stroke-width="4.5"/>
<ellipse cx="108" cy="100" rx="7" ry="34" fill="none" stroke="#B7C3D4" stroke-width="3"/>
<path d="M102 62C99 74 98 86 98 96" fill="none" stroke="#fff" stroke-width="4"/>
<rect x="108" y="95" width="26" height="10" rx="3" fill="#3B4356" stroke="#15131F" stroke-width="4"/>
<circle cx="140" cy="100" r="14" fill="#12B8D6"/>
<g clip-path="url(#cco)"><circle cx="139" cy="91" r="14" fill="#3FF0FF"/></g>
<circle cx="135" cy="94" r="4" fill="#fff"/>
<circle cx="140" cy="100" r="14" fill="none" stroke="#15131F" stroke-width="4.5"/>
</g>
</svg>`,
    /* 포세이돈의 삼지창 */
    trident: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="ga"><stop offset="0" stop-color="#C8FFF7" stop-opacity="0.95"/><stop offset="0.45" stop-color="#5FF0E0" stop-opacity="0.45"/><stop offset="1" stop-color="#5FF0E0" stop-opacity="0"/></radialGradient>
<rect id="sh" x="14" y="93" width="108" height="14" rx="7"/>
<path id="pr" d="M120 96C118 74 134 62 156 64L170 63L166 73C150 73 141 81 140 96ZM120 104C118 126 134 138 156 136L170 137L166 127C150 127 141 119 140 104ZM126 93H166V107H126Z"/>
<path id="ar" d="M160 52L193 63L160 76L167 64ZM160 148L193 137L160 124L167 136ZM156 82L200 100L156 118L165 100Z"/>
<path id="cl" d="M110 84C118 78 130 78 138 84V116C130 122 118 122 110 116Z"/>
<clipPath id="csh"><use href="#sh"/></clipPath>
<clipPath id="cpr"><use href="#pr"/></clipPath>
<clipPath id="car"><use href="#ar"/></clipPath>
<clipPath id="ccl"><use href="#cl"/></clipPath>
</defs>
<circle cx="132" cy="66" r="80" fill="url(#ga)"/>
<g transform="translate(100 100) rotate(-45) scale(0.86) translate(-102 -100)" stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="15"><use href="#sh"/><use href="#pr"/><use href="#ar"/><use href="#cl"/><circle cx="14" cy="100" r="11"/></g>
<circle cx="14" cy="100" r="11" fill="#3FE0D0" stroke="#15131F" stroke-width="4.5"/>
<circle cx="10.5" cy="96" r="3.5" fill="#fff"/>
<use href="#sh" fill="#D9951A"/>
<g clip-path="url(#csh)"><use href="#sh" fill="#FFCF3A" transform="translate(1.5 -10)"/><path d="M30 96.5H108" fill="none" stroke="#FFF0A6" stroke-width="3"/></g>
<use href="#sh" fill="none" stroke="#15131F" stroke-width="4.5"/>
<g fill="#3FE0D0" stroke="#15131F" stroke-width="3.5"><rect x="38" y="91" width="8" height="18" rx="2"/><rect x="54" y="91" width="8" height="18" rx="2"/></g>
<use href="#pr" fill="#D9951A"/>
<g clip-path="url(#cpr)"><use href="#pr" fill="#FFCF3A" transform="translate(1.5 -10)"/><path d="M127 84C128 74 138 68 152 67.5M130 96.5H162" fill="none" stroke="#FFF0A6" stroke-width="3"/></g>
<use href="#pr" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#ar" fill="#D9951A"/>
<g clip-path="url(#car)"><use href="#ar" fill="#FFCF3A" transform="translate(1.5 -10)"/></g>
<path d="M171 64L187 63.5M171 136L187 136.5M170 100H192" fill="none" stroke="#E9FFFB" stroke-width="3"/>
<use href="#ar" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#cl" fill="#D9951A"/>
<g clip-path="url(#ccl)"><use href="#cl" fill="#FFCF3A" transform="translate(1.5 -10)"/></g>
<use href="#cl" fill="none" stroke="#15131F" stroke-width="4.5"/>
<circle cx="124" cy="100" r="9" fill="#3FE0D0" stroke="#15131F" stroke-width="4"/>
<circle cx="121" cy="97" r="3" fill="#fff"/>
<path d="M36 116C50 84 66 120 82 88C90 74 100 78 106 86" fill="none" stroke="#15131F" stroke-width="9"/>
<path d="M36 116C50 84 66 120 82 88C90 74 100 78 106 86" fill="none" stroke="#3FE0D0" stroke-width="4.5"/>
</g>
<g fill="#FFF6C8" stroke="#15131F" stroke-width="2.5">
<path d="M176 12Q176 22 186 22Q176 22 176 32Q176 22 166 22Q176 22 176 12Z"/>
<path d="M52 101Q52 108 59 108Q52 108 52 115Q52 108 45 108Q52 108 52 101Z"/>
<path d="M186 106Q186 112 192 112Q186 112 186 118Q186 112 180 112Q186 112 186 106Z"/>
</g>
</svg>`,
    /* 크라켄 촉수포 */
    krakenCannon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="kc" d="M36 116C24 130 26 150 42 152C52 152 54 142 46 140C40 142 38 136 42 128Z"/>
<path id="kg" d="M84 134L76 166C75 172 82 175 87 171L102 136Z"/>
<path id="kb" d="M24 100C24 70 46 58 72 60L132 70C146 72 154 82 154 100C154 118 146 128 132 130L72 140C46 142 24 130 24 100Z"/>
<rect id="km" x="148" y="72" width="20" height="56" rx="9"/>
<path id="kt" d="M162 112C186 110 202 92 200 68C198 46 182 40 174 50C168 58 174 68 182 64C188 76 180 88 162 88Z"/>
<mask id="mkb" maskUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="300"><rect x="-50" y="-50" width="300" height="300" fill="#fff"/><use href="#kb" fill="#000" transform="translate(-1 -11)"/></mask>
<clipPath id="ckb"><use href="#kb"/></clipPath>
<clipPath id="ckt"><use href="#kt"/></clipPath>
<clipPath id="ckm"><use href="#km"/></clipPath>
<clipPath id="ckc"><use href="#kc"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-30) scale(0.8) translate(-110 -104)" stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="16"><use href="#kc"/><use href="#kg"/><use href="#kb"/><use href="#km"/><use href="#kt"/></g>
<use href="#kc" fill="#5E2BA3"/>
<g clip-path="url(#ckc)"><use href="#kc" fill="#8A4BD6" transform="translate(-1 -11)"/></g>
<use href="#kc" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#kg" fill="#3E1F73" stroke="#15131F" stroke-width="4.5"/>
<use href="#kb" fill="#8A4BD6"/>
<g clip-path="url(#ckb)">
<path d="M66 58C76 80 76 120 66 142H80C90 120 90 80 80 58ZM108 64C116 84 116 116 108 136H120C128 116 128 84 120 64Z" fill="#B07CF2" stroke="#15131F" stroke-width="3"/>
<g fill="#E7C9FF" stroke="#15131F" stroke-width="2"><circle cx="76" cy="82" r="3"/><circle cx="78" cy="100" r="3"/><circle cx="76" cy="118" r="3"/><circle cx="117" cy="86" r="2.8"/><circle cx="119" cy="100" r="2.8"/><circle cx="117" cy="114" r="2.8"/></g>
<use href="#kb" fill="#2A0F5C" opacity="0.42" mask="url(#mkb)"/>
<path d="M36 90C38 78 48 70 60 68" fill="none" stroke="#fff" stroke-width="4.5" opacity="0.75"/>
<path d="M92 70L104 72" fill="none" stroke="#fff" stroke-width="4" opacity="0.75"/>
</g>
<use href="#kb" fill="none" stroke="#15131F" stroke-width="4.5"/>
<circle cx="46" cy="96" r="12" fill="#FFD23F" stroke="#15131F" stroke-width="3.5"/>
<ellipse cx="48" cy="98" rx="3" ry="8" fill="#15131F"/>
<circle cx="43" cy="99" r="2.4" fill="#fff"/>
<path d="M33 94C34 82 58 82 59 94C52 90 40 90 33 94Z" fill="#5E2BA3" stroke="#15131F" stroke-width="3.5"/>
<use href="#km" fill="#9A6BE0"/>
<g clip-path="url(#ckm)"><use href="#km" fill="#C79BFF" transform="translate(-1 -11)"/></g>
<use href="#km" fill="none" stroke="#15131F" stroke-width="4.5"/>
<ellipse cx="165" cy="100" rx="4.5" ry="20" fill="#1A0D33"/>
<use href="#kt" fill="#6A33B8"/>
<g clip-path="url(#ckt)"><use href="#kt" fill="#9B5BE6" transform="translate(-1 -11)"/><path d="M168 94C178 92 186 86 190 76" fill="none" stroke="#fff" stroke-width="3.5" opacity="0.7"/></g>
<use href="#kt" fill="none" stroke="#15131F" stroke-width="4.5"/>
<g fill="#E7C9FF" stroke="#15131F" stroke-width="2"><circle cx="178" cy="104" r="3.4"/><circle cx="190" cy="94" r="3"/><circle cx="196" cy="80" r="2.6"/><circle cx="196" cy="66" r="2.2"/></g>
</g>
</svg>`,
    /* 심연 레이저 삼지창 */
    laserTrident: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gl"><stop offset="0" stop-color="#55F6FF" stop-opacity="0.8"/><stop offset="1" stop-color="#55F6FF" stop-opacity="0"/></radialGradient>
<path id="lp" d="M2 100L14 86L26 100L14 114Z"/>
<rect id="ls" x="20" y="93" width="96" height="14" rx="4"/>
<path id="le" d="M108 82L130 76L142 86V114L130 124L108 118Z"/>
<path id="en" d="M140 91L182 93L202 100L182 107L140 109ZM134 84L148 62L188 60L198 65L188 70L154 72L144 88ZM134 116L148 138L188 140L198 135L188 130L154 128L144 112Z"/>
<clipPath id="cls"><use href="#ls"/></clipPath>
<clipPath id="cle"><use href="#le"/></clipPath>
<clipPath id="clp"><use href="#lp"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-62) scale(0.84) translate(-104 -100)" stroke-linejoin="round" stroke-linecap="round">
<circle cx="164" cy="100" r="58" fill="url(#gl)"/>
<g fill="#15131F" stroke="#15131F" stroke-width="15"><use href="#lp"/><use href="#ls"/><use href="#en"/><use href="#le"/></g>
<use href="#lp" fill="#19B8D0"/>
<g clip-path="url(#clp)"><use href="#lp" fill="#55F6FF" transform="translate(4.6 -9.2)"/></g>
<use href="#lp" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#ls" fill="#141C45"/>
<g clip-path="url(#cls)"><use href="#ls" fill="#22306B" transform="translate(4.6 -9.2)"/></g>
<use href="#ls" fill="none" stroke="#15131F" stroke-width="4.5"/>
<g fill="#55F6FF" stroke="#15131F" stroke-width="2.5"><rect x="36" y="97" width="12" height="6" rx="2"/><rect x="58" y="97" width="12" height="6" rx="2"/><rect x="80" y="97" width="12" height="6" rx="2"/></g>
<use href="#en" fill="#55F6FF"/>
<path d="M148 100H192M151 66.5L188 64.5M151 133.5L188 135.5" fill="none" stroke="#fff" stroke-width="3.5"/>
<use href="#en" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#le" fill="#141C45"/>
<g clip-path="url(#cle)"><use href="#le" fill="#2B3C85" transform="translate(4.6 -9.2)"/></g>
<path d="M126 88V112" fill="none" stroke="#55F6FF" stroke-width="3.5"/>
<use href="#le" fill="none" stroke="#15131F" stroke-width="4.5"/>
</g>
<g fill="#55F6FF" stroke="#15131F" stroke-width="2.5">
<path d="M170 76L176 82L170 88L164 82Z"/>
<path d="M98 30L103 35L98 40L93 35Z"/>
<path d="M176 34L180 38L176 42L172 38Z"/>
</g>
</svg>`,
    /* 진주 저격포 */
    pearlSniper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gp"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="0.5" stop-color="#FFC7DC" stop-opacity="0.5"/><stop offset="1" stop-color="#FFC7DC" stop-opacity="0"/></radialGradient>
<path id="ss" d="M48 98L20 76C8 90 6 116 18 134L48 112Z"/>
<rect id="rv" x="40" y="90" width="66" height="24" rx="11"/>
<rect id="br" x="100" y="95" width="80" height="10" rx="4"/>
<rect id="mz" x="176" y="90" width="16" height="20" rx="5"/>
<path id="gr" d="M62 112L54 142C53 148 60 151 64 147L80 114Z"/>
<path id="cu" d="M58 84C42 70 44 44 64 38C82 33 94 46 90 60Z"/>
<path id="cb" d="M50 86C54 101 90 101 94 86Z"/>
<circle id="pr" cx="72" cy="70" r="19"/>
<clipPath id="css"><use href="#ss"/></clipPath>
<clipPath id="crv"><use href="#rv"/></clipPath>
<clipPath id="cbr"><use href="#br"/></clipPath>
<clipPath id="ccu"><use href="#cu"/></clipPath>
<clipPath id="cpr"><use href="#pr"/></clipPath>
</defs>
<g transform="translate(100 100) rotate(-28) scale(0.9) translate(-98 -96)" stroke-linejoin="round" stroke-linecap="round">
<circle cx="72" cy="70" r="50" fill="url(#gp)"/>
<g fill="#15131F" stroke="#15131F" stroke-width="15"><use href="#ss"/><use href="#gr"/><use href="#br"/><use href="#mz"/><use href="#rv"/><use href="#cu"/><use href="#cb"/><use href="#pr"/></g>
<use href="#ss" fill="#F08BB0"/>
<g clip-path="url(#css)"><use href="#ss" fill="#FFB3CF" transform="translate(-1.3 -9.5)"/></g>
<path d="M46 105L18 84M46 105L11 99M46 105L11 112M46 105L18 126" fill="none" stroke="#15131F" stroke-width="2.5"/>
<use href="#ss" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#gr" fill="#FF8FB8" stroke="#15131F" stroke-width="4.5"/>
<use href="#br" fill="#D9CCD8"/>
<g clip-path="url(#cbr)"><use href="#br" fill="#FFF7FA" transform="translate(-1.3 -6)"/></g>
<use href="#br" fill="none" stroke="#15131F" stroke-width="4.5"/>
<g fill="#FF8FB8" stroke="#15131F" stroke-width="3"><rect x="130" y="93" width="6" height="14" rx="2"/><rect x="154" y="93" width="6" height="14" rx="2"/></g>
<use href="#mz" fill="#FF8FB8" stroke="#15131F" stroke-width="4.5"/>
<use href="#rv" fill="#E8C9D8"/>
<g clip-path="url(#crv)"><use href="#rv" fill="#FFF7FA" transform="translate(-1.3 -9.5)"/><path d="M52 95H96" fill="none" stroke="#fff" stroke-width="3"/></g>
<use href="#rv" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#cu" fill="#F08BB0"/>
<g clip-path="url(#ccu)"><use href="#cu" fill="#FFB3CF" transform="translate(-1.3 -9.5)"/></g>
<path d="M60 80C56 66 58 50 66 42M68 76C68 64 72 52 78 44M76 70C78 62 82 56 86 52" fill="none" stroke="#15131F" stroke-width="2.5"/>
<use href="#cu" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#pr" fill="#F2C1D6"/>
<g clip-path="url(#cpr)"><use href="#pr" fill="#FFF6FA" transform="translate(-1.3 -8)"/></g>
<ellipse cx="65" cy="62" rx="6.5" ry="4" fill="#fff" transform="rotate(-30 65 62)"/>
<circle cx="80" cy="76" r="2.2" fill="#fff"/>
<use href="#pr" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#cb" fill="#FFC7DC" stroke="#15131F" stroke-width="4.5"/>
<path d="M62 89V96M72 89V98M82 89V96" fill="none" stroke="#15131F" stroke-width="2.5"/>
</g>
</svg>`,
    /* 연막 발사기: 먹물 연막 모듈 */
    smoke: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="bt" d="M86 66V86C62 94 50 110 50 128C50 156 72 176 100 176C128 176 150 156 150 128C150 110 138 94 114 86V66Z"/>
<rect id="cp" x="78" y="40" width="44" height="24" rx="7"/>
<clipPath id="cbt"><use href="#bt"/></clipPath>
<clipPath id="ccp"><use href="#cp"/></clipPath>
<mask id="mbt" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect x="0" y="0" width="200" height="200" fill="#fff"/><use href="#bt" fill="#000" transform="translate(-5 -7)"/></mask>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="13">
<use href="#bt"/><rect x="80" y="60" width="40" height="12" rx="4"/><use href="#cp"/><rect x="94" y="28" width="12" height="14" rx="3"/>
<circle cx="122" cy="27" r="10"/><circle cx="138" cy="18" r="9"/><circle cx="147" cy="34" r="11"/><circle cx="131" cy="41" r="8"/><circle cx="73" cy="25" r="7"/>
</g>
<use href="#bt" fill="#5B6894"/>
<g clip-path="url(#cbt)">
<path d="M40 118C60 110 80 126 100 118C120 110 140 126 160 118V190H40Z" fill="#2B1F52"/>
<path d="M54 123C68 117 82 127 96 121" fill="none" stroke="#8A6CD0" stroke-width="3" opacity="0.9"/>
<circle cx="118" cy="146" r="3" fill="#6B4FA8"/><circle cx="84" cy="156" r="2.4" fill="#6B4FA8"/>
<use href="#bt" fill="#0B0A1A" opacity="0.45" mask="url(#mbt)"/>
<path d="M62 120C62 108 70 98 80 94" fill="none" stroke="#fff" stroke-width="6" opacity="0.85"/>
<circle cx="63" cy="134" r="3.5" fill="#fff" opacity="0.7"/>
</g>
<path d="M40 118C60 110 80 126 100 118C120 110 140 126 160 118" fill="none" stroke="#15131F" stroke-width="3" clip-path="url(#cbt)"/>
<use href="#bt" fill="none" stroke="#15131F" stroke-width="4"/>
<rect x="80" y="60" width="40" height="12" rx="4" fill="#8C98AD" stroke="#15131F" stroke-width="4"/>
<use href="#cp" fill="#8C98AD"/>
<g clip-path="url(#ccp)"><use href="#cp" fill="#C9D3E0" transform="translate(-5 -7)"/><rect x="84" y="44" width="16" height="4" rx="2" fill="#fff" opacity="0.8"/></g>
<use href="#cp" fill="none" stroke="#15131F" stroke-width="4"/>
<rect x="94" y="28" width="12" height="14" rx="3" fill="#8C98AD" stroke="#15131F" stroke-width="3.5"/>
<ellipse cx="100" cy="29" rx="14" ry="5" fill="#FF5A5F" stroke="#15131F" stroke-width="3.5"/>
<g fill="#3E3260" stroke="#15131F" stroke-width="4">
<circle cx="73" cy="25" r="7"/><circle cx="131" cy="41" r="8"/><circle cx="147" cy="34" r="11"/><circle cx="122" cy="27" r="10"/><circle cx="138" cy="18" r="9"/>
</g>
<g fill="none" stroke="#7A6AA0" stroke-width="3">
<path d="M116 23C118 20 121 19 124 19"/><path d="M133 14C135 12 137 11 140 11"/><path d="M141 30C143 27 146 26 149 26"/>
</g>
</g>
</svg>`,
    /* 심해 음탐기: 고급 소나 센서 */
    sonar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<rect id="bx" x="40" y="104" width="120" height="74" rx="20"/>
<path id="bw" d="M-36 0C-36 24 36 24 36 0Z"/>
<clipPath id="cbx"><use href="#bx"/></clipPath>
<clipPath id="cbw"><use href="#bw"/></clipPath>
<clipPath id="csc"><circle cx="100" cy="142" r="22"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="none" stroke="#15131F" stroke-width="9"><path d="M113.5 24.8A16 16 0 0 1 130.4 36.6"/><path d="M112.5 12.8A28 28 0 0 1 141.9 33.5"/></g>
<g fill="none" stroke="#3CFF9E" stroke-width="4.5"><path d="M113.5 24.8A16 16 0 0 1 130.4 36.6"/><path d="M112.5 12.8A28 28 0 0 1 141.9 33.5"/></g>
<g fill="#15131F" stroke="#15131F" stroke-width="13">
<rect x="93" y="70" width="14" height="40"/><use href="#bx"/>
<g transform="translate(100 62) rotate(35)"><use href="#bw"/><ellipse cx="0" cy="0" rx="36" ry="11"/><path d="M0 0V-22"/><circle cx="0" cy="-26" r="5.5"/></g>
</g>
<rect x="93" y="70" width="14" height="40" fill="#8C98AD" stroke="#15131F" stroke-width="4"/>
<rect x="96" y="74" width="4" height="30" rx="2" fill="#C9D3E0"/>
<use href="#bx" fill="#E0A21E"/>
<g clip-path="url(#cbx)">
<use href="#bx" fill="#FFD23F" transform="translate(-5 -7)"/>
<path d="M50 150V126C50 118 54 114 62 114" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
</g>
<use href="#bx" fill="none" stroke="#15131F" stroke-width="4"/>
<path d="M52 132H64M52 140H64M52 148H64" fill="none" stroke="#15131F" stroke-width="3.5"/>
<circle cx="100" cy="142" r="28" fill="#3B4356" stroke="#15131F" stroke-width="4"/>
<circle cx="100" cy="142" r="22" fill="#0F3B3A"/>
<g clip-path="url(#csc)">
<g fill="none" stroke="#2EE59D" stroke-width="1.8"><circle cx="100" cy="142" r="14"/><circle cx="100" cy="142" r="7"/></g>
<path d="M78 142H122M100 120V164" fill="none" stroke="#2EE59D" stroke-width="1.4" opacity="0.6"/>
<path d="M100 142L100 120A22 22 0 0 1 119.05 131Z" fill="#3CFF9E" opacity="0.55"/>
<circle cx="111" cy="133" r="2.6" fill="#C8FFE3"/><circle cx="91" cy="151" r="2.2" fill="#C8FFE3"/>
</g>
<circle cx="100" cy="142" r="22" fill="none" stroke="#15131F" stroke-width="3"/>
<circle cx="142" cy="126" r="5.5" fill="#FF5A5F" stroke="#15131F" stroke-width="3"/>
<circle cx="142" cy="146" r="5.5" fill="#3CFF9E" stroke="#15131F" stroke-width="3"/>
<g transform="translate(100 62) rotate(35)">
<use href="#bw" fill="#8C98AD"/>
<g clip-path="url(#cbw)"><use href="#bw" fill="#C9D3E0" transform="translate(-8 -3)"/></g>
<use href="#bw" fill="none" stroke="#15131F" stroke-width="4"/>
<ellipse cx="0" cy="0" rx="36" ry="11" fill="#E6EEF7" stroke="#15131F" stroke-width="4"/>
<ellipse cx="0" cy="0" rx="18" ry="5" fill="none" stroke="#B7C3D4" stroke-width="2.5"/>
<path d="M0 0V-22" fill="none" stroke="#15131F" stroke-width="7"/>
<path d="M0 0V-22" fill="none" stroke="#C9D3E0" stroke-width="3"/>
<circle cx="0" cy="-26" r="5.5" fill="#FF5A5F" stroke="#15131F" stroke-width="3"/>
<circle cx="-1.8" cy="-28" r="1.6" fill="#fff"/>
</g>
</g>
</svg>`,
    /* 고래가죽 장갑: 강화 장갑판 */
    whaleArmor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<path id="sp" d="M100 24C122 34 142 38 162 38C164 104 142 150 100 178C58 150 36 104 38 38C58 38 78 34 100 24Z"/>
<path id="ip" d="M100 46C116 53 131 56 145 56C145 104 129 137 100 157C71 137 55 104 55 56C69 56 84 53 100 46Z"/>
<clipPath id="csp"><use href="#sp"/></clipPath>
<clipPath id="cip"><use href="#ip"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<use href="#sp" fill="#15131F" stroke="#15131F" stroke-width="13"/>
<use href="#sp" fill="#2478C4"/>
<g clip-path="url(#csp)"><use href="#sp" fill="#4FB2F2" transform="translate(-5 -7)"/><path d="M46 50C46 84 53 110 65 132" fill="none" stroke="#A8DEFF" stroke-width="5"/></g>
<use href="#sp" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#ip" fill="#2478C4"/>
<g clip-path="url(#cip)">
<use href="#ip" fill="#62C0F6" transform="translate(-4 -6)"/>
<path d="M66 64C80 63 91 59 100 55" fill="none" stroke="#fff" stroke-width="4" opacity="0.8"/>
</g>
<use href="#ip" fill="none" stroke="#15131F" stroke-width="4"/>
<path d="M74 86L100 102L126 86V100L100 116L74 100Z" fill="#FFD23F" stroke="#15131F" stroke-width="4"/>
<path d="M74 110L100 126L126 110V124L100 140L74 124Z" fill="#FFD23F" stroke="#15131F" stroke-width="4"/>
<path d="M78 92L100 106" fill="none" stroke="#FFF2A6" stroke-width="2.5"/>
<path d="M78 116L100 130" fill="none" stroke="#FFF2A6" stroke-width="2.5"/>
<g fill="#E6EEF7" stroke="#15131F" stroke-width="2.5"><circle cx="47" cy="47" r="4.5"/><circle cx="153" cy="47" r="4.5"/><circle cx="58" cy="118" r="3.8"/><circle cx="142" cy="118" r="3.8"/><circle cx="100" cy="167" r="4.2"/></g>
</g>
</svg>`,
    /* 과급 스크류: 고속 프로펠러 엔진 */
    supercharge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<rect id="eb" x="-46" y="-22" width="86" height="44" rx="20"/>
<path id="nc" d="M38 -16C50 -12 56 -6 56 0C56 6 50 12 38 16Z"/>
<path id="bl" d="M122 82C108 66 110 40 122 34C134 40 136 66 122 82Z"/>
<clipPath id="ceb"><use href="#eb"/></clipPath>
<clipPath id="cbl"><use href="#bl"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#E8F8FF" stroke="#15131F" stroke-width="3"><circle cx="28" cy="176" r="6.5"/><circle cx="16" cy="160" r="4.5"/><circle cx="44" cy="190" r="4"/></g>
<g fill="none" stroke="#15131F" stroke-width="9"><path d="M71.8 53A58 58 0 0 1 107 26"/><path d="M176.5 101.8A58 58 0 0 1 146.5 134.6"/></g>
<g fill="none" stroke="#FFB8D9" stroke-width="4.5"><path d="M71.8 53A58 58 0 0 1 107 26"/><path d="M176.5 101.8A58 58 0 0 1 146.5 134.6"/></g>
<g transform="translate(78 124) rotate(-42)">
<g fill="#15131F" stroke="#15131F" stroke-width="13"><use href="#eb"/><use href="#nc"/><path d="M-28 -20L-40 -36L-14 -22Z"/></g>
<path d="M-28 -20L-40 -36L-14 -22Z" fill="#D63F86" stroke="#15131F" stroke-width="4"/>
<use href="#eb" fill="#8C98AD"/>
<g clip-path="url(#ceb)">
<use href="#eb" fill="#C9D3E0" transform="translate(1 -8.5)"/>
<rect x="-8" y="-24" width="12" height="48" fill="#FF6FB0"/>
<rect x="-38" y="-14" width="24" height="5" rx="2.5" fill="#fff" opacity="0.8"/>
</g>
<path d="M-8 -22V22M4 -22V22" fill="none" stroke="#15131F" stroke-width="3"/>
<use href="#eb" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#nc" fill="#C9D3E0" stroke="#15131F" stroke-width="4"/>
</g>
<g fill="#15131F" stroke="#15131F" stroke-width="13">
<use href="#bl" transform="rotate(20 122 82)"/><use href="#bl" transform="rotate(140 122 82)"/><use href="#bl" transform="rotate(260 122 82)"/>
</g>
<g transform="rotate(20 122 82)">
<use href="#bl" fill="#D63F86"/>
<g clip-path="url(#cbl)"><use href="#bl" fill="#FF6FB0" transform="translate(-7 -5)"/></g>
<use href="#bl" fill="none" stroke="#15131F" stroke-width="4"/>
</g>
<g transform="rotate(140 122 82)">
<use href="#bl" fill="#D63F86"/>
<g clip-path="url(#cbl)"><use href="#bl" fill="#FF6FB0" transform="translate(-0.7 8.6)"/></g>
<use href="#bl" fill="none" stroke="#15131F" stroke-width="4"/>
</g>
<g transform="rotate(260 122 82)">
<use href="#bl" fill="#D63F86"/>
<g clip-path="url(#cbl)"><use href="#bl" fill="#FF6FB0" transform="translate(7.8 -3.7)"/></g>
<use href="#bl" fill="none" stroke="#15131F" stroke-width="4"/>
</g>
<ellipse cx="126" cy="50" rx="2.6" ry="7" fill="#FFD1E6" transform="rotate(20 126 50)"/>
<circle cx="122" cy="82" r="11" fill="#C9D3E0" stroke="#15131F" stroke-width="4"/>
<circle cx="122" cy="82" r="4" fill="#8C98AD"/>
<circle cx="118" cy="78" r="2.5" fill="#fff"/>
</g>
</svg>`,
    /* 심해 디젤 심장: 비상 부력 추진기 */
    diesel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gy"><stop offset="0" stop-color="#FFE066" stop-opacity="0.85"/><stop offset="1" stop-color="#FFE066" stop-opacity="0"/></radialGradient>
<rect id="bd" x="64" y="42" width="72" height="100" rx="36"/>
<path id="nz" d="M82 136H118L126 156H74Z"/>
<path id="sf" d="M66 104L46 128C44 134 50 138 56 134L70 124ZM134 104L154 128C156 134 150 138 144 134L130 124Z"/>
<path id="fl" d="M100 152C114 162 116 178 100 192C84 178 86 162 100 152Z"/>
<path id="ld" d="M84 44C84 28 116 28 116 44Z"/>
<clipPath id="cbd"><use href="#bd"/></clipPath>
<clipPath id="cnz"><use href="#nz"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<circle cx="100" cy="32" r="34" fill="url(#gy)"/>
<g fill="#15131F" stroke="#15131F" stroke-width="13"><use href="#fl"/><use href="#sf"/><use href="#nz"/><use href="#bd"/><use href="#ld"/><rect x="80" y="40" width="40" height="9" rx="3"/></g>
<use href="#fl" fill="#FF9F45" stroke="#15131F" stroke-width="4"/>
<path d="M100 160C108 167 108 176 100 184C92 176 92 167 100 160Z" fill="#FFE066"/>
<g fill="#E8F8FF" stroke="#15131F" stroke-width="3"><circle cx="70" cy="172" r="6"/><circle cx="132" cy="178" r="5"/><circle cx="60" cy="188" r="4"/><circle cx="142" cy="162" r="4"/></g>
<use href="#sf" fill="#C8343B" stroke="#15131F" stroke-width="4"/>
<use href="#nz" fill="#3B4356"/>
<g clip-path="url(#cnz)"><use href="#nz" fill="#5A6478" transform="translate(-5 -7)"/></g>
<use href="#nz" fill="none" stroke="#15131F" stroke-width="4"/>
<use href="#bd" fill="#C8343B"/>
<g clip-path="url(#cbd)">
<use href="#bd" fill="#FF5A5F" transform="translate(-5 -7)"/>
<rect x="60" y="64" width="80" height="14" fill="#FFFFFF"/>
<rect x="60" y="74" width="80" height="4" fill="#E6D8DA"/>
<path d="M74 70V118" fill="none" stroke="#fff" stroke-width="6" opacity="0.8"/>
</g>
<path d="M64 64H136M64 78H136" fill="none" stroke="#15131F" stroke-width="3"/>
<use href="#bd" fill="none" stroke="#15131F" stroke-width="4"/>
<path d="M86 106L100 94L114 106V116L100 104L86 116Z" fill="#fff" stroke="#15131F" stroke-width="3.5"/>
<path d="M86 124L100 112L114 124V132L100 120L86 132Z" fill="#fff" stroke="#15131F" stroke-width="3.5"/>
<rect x="80" y="40" width="40" height="9" rx="3" fill="#C9D3E0" stroke="#15131F" stroke-width="3.5"/>
<use href="#ld" fill="#FFD23F" stroke="#15131F" stroke-width="4"/>
<path d="M92 38C92 33 96 31 100 31" fill="none" stroke="#fff" stroke-width="3"/>
</g>
</svg>`,
    /* 긴급 수리 키트: 치유 산호 모듈 */
    repair: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<defs>
<radialGradient id="gg"><stop offset="0" stop-color="#B6FFCB" stop-opacity="0.9"/><stop offset="1" stop-color="#5BEA8C" stop-opacity="0"/></radialGradient>
<path id="pd" d="M46 150C46 138 58 132 72 132H128C142 132 154 138 154 150V160C154 172 142 178 128 178H72C58 178 46 172 46 160Z"/>
<path id="dm" d="M50 140C50 82 72 46 100 46C128 46 150 82 150 140Z"/>
<path id="cr" d="M100 138V108M100 118C96 108 84 104 80 90M82 96C74 92 70 84 72 74M100 112C104 100 118 98 120 82M117 90C126 86 130 78 128 68M100 108V76"/>
<clipPath id="cpd"><use href="#pd"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g fill="#15131F" stroke="#15131F" stroke-width="13"><use href="#dm"/><use href="#pd"/>
<path d="M152 44h10v10h10v10h-10v10h-10v-10h-10v-10h10Z"/><path d="M34 90h7v7h7v7h-7v7h-7v-7h-7v-7h7Z"/></g>
<use href="#dm" fill="#E9FBFF"/>
<circle cx="100" cy="98" r="54" fill="url(#gg)"/>
<use href="#cr" fill="none" stroke="#15131F" stroke-width="19"/>
<use href="#cr" fill="none" stroke="#24B25A" stroke-width="11"/>
<use href="#cr" fill="none" stroke="#5BEA8C" stroke-width="6" transform="translate(-1.5 -1.5)"/>
<g fill="#B6FFCB" stroke="#15131F" stroke-width="3.5"><circle cx="72" cy="72" r="7"/><circle cx="80" cy="88" r="6"/><circle cx="100" cy="74" r="7"/><circle cx="120" cy="80" r="6"/><circle cx="128" cy="66" r="7"/></g>
<g fill="#fff"><circle cx="70" cy="70" r="2.2"/><circle cx="98" cy="72" r="2.2"/><circle cx="126" cy="64" r="2.2"/></g>
<g fill="#fff" stroke="#15131F" stroke-width="2"><circle cx="70" cy="116" r="3.5"/><circle cx="132" cy="104" r="3"/><circle cx="124" cy="120" r="2.4"/></g>
<use href="#dm" fill="#fff" opacity="0.18"/>
<path d="M64 122C62 98 70 76 84 62" fill="none" stroke="#fff" stroke-width="6" opacity="0.85"/>
<use href="#dm" fill="none" stroke="#15131F" stroke-width="4.5"/>
<use href="#pd" fill="#8C98AD"/>
<g clip-path="url(#cpd)"><use href="#pd" fill="#C9D3E0" transform="translate(-5 -7)"/></g>
<use href="#pd" fill="none" stroke="#15131F" stroke-width="4"/>
<rect x="62" y="150" width="76" height="9" rx="4.5" fill="#5BEA8C" stroke="#15131F" stroke-width="3"/>
<rect x="66" y="152" width="22" height="3" rx="1.5" fill="#fff" opacity="0.8"/>
<path d="M152 44h10v10h10v10h-10v10h-10v-10h-10v-10h10Z" fill="#5BEA8C" stroke="#15131F" stroke-width="3.5"/>
<path d="M34 90h7v7h7v7h-7v7h-7v-7h-7v-7h7Z" fill="#5BEA8C" stroke="#15131F" stroke-width="3"/>
</g>
</svg>`,
  };

  const imgs = {};
  const loads = Object.keys(SVG).map(id => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG[id]);
    imgs[id] = img;
    const done = img.decode ? img.decode() : new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    return done.catch(() => {});
  });
  let usable = true;
  /* 다 불러온 그림만 돌려준다. null이면 옛 캔버스 그림을 쓴다. */
  A.gearIcon = id => {
    const img = imgs[id];
    return usable && img && img.complete && img.naturalWidth > 0 ? img : null;
  };
  /* menu.js는 이것을 기다린 뒤 첫 화면을 그린다. SVG를 그린 캔버스를 읽지 못하는 브라우저는 옛 그림으로 돌아간다. */
  A.gearReady = Promise.race([Promise.all(loads), new Promise(r => setTimeout(r, 2000))]).then(() => {
    try {
      const c = A.mk(8);
      c.getContext('2d').drawImage(imgs.twinHarpoon, 0, 0, 8, 8);
      c.toDataURL();
    } catch (e) { usable = false; }
  });
})(window.Art);
